***************************
之前一段时间在自学`React.js`。虚拟`DOM`、组件化的设计，感觉在一定程度上的确颠覆了传统的开发方法。通过把不同区块/功能的代码，封装成各自的组件，最后再组合起来，这样在开发较大型的网站时变得十分的方便，而且组件代码的重用也变得简单。而不同的组件之间，必然存在通信的问题。由于组件是在虚拟`DOM`上，所以传统的通信方法在`react`中，未必是那么的容易。下面这篇文章，则是我参考了网上许多的资料文章，结合自己的动手测试而总结写下的。主题就是关于，在不同情况下`react`组件的通信方法。

------------------------

###一. 父组件 -> 子组件 ([点击查看demo](demos/article2/1.html))
这是最简单的一种情况，但同时也是最常用的一种情况。`react`很重要的一个核心就是`props`和`state`这两个属性。子组件可以通过`this.props`取得父组件传递的属性，而父组件传递给子组件的属性，也可以用`this.state`根据情况随时变化。举个简单例子，父组件在鼠标点击后，要通知子组件改变文字，代码如下:

```javascript
    var Father = React.createClass({
        getInitialState: function(){
            return {
                text: 'nothing'
            };
        },
        handleClick: function(){
            this.setState({text:'Hi son!'});
        },
        render: function(){
            return (
              <div>
                <h1 onClick={this.handleClick}>I am the Father, click me!</h1>
                <Son text={this.state.text}/> 
              </div>
            );
        }
    });

    var Son = React.createClass({
        render: function(){
            return (
                <h3>My father tell me: {this.props.text}</h3>
            );
        }
    });

    React.render(
        <Father />, document.body
    );
```

**效果：**一开始子组件显示"My father tell me: nothing"; 点击父组件("I am the Father, click me!")后，子组件显示"My father tell me: Hi son"，实现了父组件到子组件的通信。

--------------------------

###二. 子组件 -> 父组件 ([点击查看demo](demos/article2/2.html))
子组件要传递信息给父组件，同样使用的是`props`和`state`，不过思路改为父组件传递函数的句柄给子组件，供子组件在特定的时候回调。同样以类似上述的例子，子组件在鼠标点击后，通知父组件改变文字，代码如下:

```javascript
    var Father = React.createClass({
        getInitialState: function(){
            return {
                text: 'nothing'
            };
        },
        fatherHandleClick: function(){
            this.setState({text:'Hi father!'});
        },
        render: function(){
            return (
              <div>
                <h1>My son tell me: {this.state.text}</h1>
                <Son fatherHandleClick={this.fatherHandleClick}/> 
              </div>
            );
        }
    });

    var Son = React.createClass({
        render: function(){
            return (
                <h3 onClick={this.props.fatherHandleClick}>I am the son, click me!</h3>
            );
        }
    });

    React.render(
        <Father />, document.body
    );
```

**效果：**一开始父组件显示"My son tell me: nothing"; 点击子组件("I am the son, click me!")后，父组件显示"My son tell me: Hi father"，实现了子组件到父组件的通信。

--------------------------


###三. 无关组件 + 层次相差太远的父子组件 ([点击查看demo](demos/article2/3.html))
考虑上述的父->子，子->父情况，若他们不是直接的父子关系，而是中间相隔了多层的祖父、曾祖父、曾曾祖父...如果仍按照步骤一、二的思路，虽然仍可以实现，但是所有的中间组件，都需要传递对于它们无意义的属性/句柄，肯定是相当不理想的。再有，若两个组件根本就没有父子关系，则用上述方法更是难以使用。面对这种情况，也许会有多种的思路方法，但每种方法都会各有利弊。以下我将记录一种 __基于自定义事件__ 的方法。这种方法我测试过可行，但的确也有它的弊端。

<br />
####1. 首先定义两个无关组件，其中第一个用于接收信息，第二个用于发送信息。同时定义两个div，用于渲染两个组件。

```
    <div id="component1"></div>
    <div id="component2"></div>

    <script type="text/jsx">
        var Component1 = React.createClass({
            getInitialState: function(){
                return {
                    message: 'nothing'
                }; 
            },
            render: function(){
                return (
                    <h1>I am component 1, I have receieved {this.state.message}</h1> 
                );
            }
        });

        var Component2 = React.createClass({
            handleClick: function(){
            },
            render: function(){
                return (
                    <h1 onClick={this.handleClick}>I am component 2, click me to send message</h1>
                ); 
            }
        });

        React.render(<Component1 />, document.querySelector('#component1'));
        React.render(<Component2 />, document.querySelector('#component2'));
    </script>
```


<br />
####2. 在组件1的`componentDidMount`中，先找到组件对应的真实D`OM`节点，然后用原生的`addEventListener`添加绑定自定义事件(`myEvent`)。同时在`componentWillUnmount`中，也要添加`removeEventListener`。由于`addEventListener`与`removeEventListener`需用到同一个函数的句柄，所以在组件中增加一个`eventHandle`函数，用作接收消息后处理。

```
    //......
    var Component1 = React.createClass({
        //......
        eventHandle: function(){
            this.setState({message: 'message from component2'});
        },
        componentDidMount: function(){
            React.findDOMNode(this).addEventListener('myEvent', this.eventHandle);
        },
        componentWillUnmount: function(){
            React.findDOMNode(this).removeEventListener('myEvent', this.eventHandle);
        },
        //......
    });
    //......
```

<br />
####3. 在组件外的全局作用域中，用一个变量记录组件1的真实`DOM`节点，用于在组件2中，手动触发组件1所监听的事件。

```
    //......
    var component1_node;
    var Component1 = React.createClass({
        //......
        componentDidMount: function(){
            component1_node = React.findDOMNode(this);
            React.findDOMNode(this).addEventListener('myEvent', this.eventHandle);
        },
        //......
    });
    //......
```

<br />
####4.在组件2的`handleClick`中，利用第3步的全局变量`component1_node`，手动触发组件1绑定监听的事件。 

```
    //......
    var Component2 = React.createClass({
        handleClick: function(){
            var event_handle = document.createEvent('Events');
            event_handle.initEvent('myEvent', true, true);
            component1_node.dispatchEvent(event_handle);
        },
        render: function(){
            return (
                <h1 onClick={this.handleClick}>I am component 2, click me to send message</h1>
            ); 
        }
    });
    //......
```


<br />
**最终，在点击组件2之后，组件1会收到信息，更新为"I am component 1, I have receieved message from component2"。完整代码如下：**

```
    <div id="component1"></div>
    <div id="component2"></div>

    <script type="text/jsx">
        var component1_node;

        var Component1 = React.createClass({
            getInitialState: function(){
                return {
                    message: 'nothing'
                }; 
            },
            eventHandle: function(){
                this.setState({message: 'message from component2'});
            },
            componentDidMount: function(){
                component1_node = React.findDOMNode(this);
                React.findDOMNode(this).addEventListener('myEvent', this.eventHandle);
            },
            componentWillUnmount: function(){
                React.findDOMNode(this).removeEventListener('myEvent', this.eventHandle);
            },
            render: function(){
                return (
                    <h1>I am component 1, I have receieved {this.state.message}</h1> 
                );
            }
        });

        var Component2 = React.createClass({
            handleClick: function(){
                var event_handle = document.createEvent('Events');
                event_handle.initEvent('myEvent', true, true);
                component1_node.dispatchEvent(event_handle);
            },
            render: function(){
                return (
                    <h1 onClick={this.handleClick}>I am component 2, click me to send message</h1>
                ); 
            }
        });

        React.render(<Component1 />, document.querySelector('#component1'));
        React.render(<Component2 />, document.querySelector('#component2'));
    </script>
```


