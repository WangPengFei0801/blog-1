*******************

```
    <script type="text/jsx">
      var Contact1_handler;

      var Contact1 = React.createClass({
        getInitialState: function(){
          return {
            text: '我还没有收到信息'
          };
        },
        componentWillUnmount: function(){
          alert('fuck i have been destroyed!')
        },
        componentDidMount: function(){
          Contact1_handler = React.findDOMNode(this);
          React.findDOMNode(this).addEventListener('contact', function(){
            alert('我是组件1，我收到组件2的通信了！');            
          });
        },
        render: function(){
          return (
            <h3>我是组件1，{this.state.text}</h3>
          );
        }
      });

      var Contact2 = React.createClass({
        handleClick: function(){
          //alert(this.refs.button.getDOMNode().innerHTML);
          var newEvent = document.createEvent('Events');
          newEvent.initEvent('contact', true, true);
          Contact1_handler.dispatchEvent(newEvent);
        },
        render: function(){
          return (
            <button onClick={this.handleClick} ref="button">我是组件2，点击我与组价1通信</button> 
          );  
        }
      });

      React.render(
        <Contact1 />,
        document.querySelector('#contact1')
      );

      React.render(
        <Contact2 />,
        document.querySelector('#contact2')
      );

      setTimeout(function(){
        //销毁组件
        React.unmountComponentAtNode(document.querySelector('#contact1'));
      }, 5000);
    </script>

```