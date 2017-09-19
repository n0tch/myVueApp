(function(){

  var pubNubSettings ={
    channels: ['mychannel']
  };

  pubNubSettings.history = {
    channel: pubNubSettings.channels[0],
    count: 20
  };

  var pubnub = new PubNub({
    publishKey: 'pub-c-625b073b-68ac-4233-b781-473e838f4fb2',
    subscribeKey: 'sub-c-ba057c0e-9d34-11e7-bca7-86deca6fdfb0'
  });

  var states = {
    name:'',
    msgs:[],
  };

  function initPubNub(){
    pubnub.addListener({
      message: function(data){
        var type = data.message.name == states.name ? 'sent' : 'received';
        var name = type == 'sent' ? states.name: data.message.name;
        states.msgs.push({name:name, text:data.message.text, type:type});
      }
    });

    pubnub.subscribe({
      channels: pubNubSettings.channels
    });

    pubnub.history(pubNubSettings.history, function(status, response){
      var history = response.messages;
      for(var i=0;i<history.length;i++){
        var type = history[i].entry.name == states.name ? 'send':'receivd';
        states.msgs.push({
          name: history[i].entry.name,
          text:history[i].entry.text,
          type:type
        })
      }
    })
  }
  function init(){
    // Init F7 Vue Plugin
    Vue.use(Framework7Vue);

    // Init Page Components
    Vue.component('page-chat', {
      template: '#page-chat',
      data:function(){
        return states;
      },
      methods: {
        onSend: function(text, clear){
          if(text.trim().lenght === 0) return ;
            pubnub.publish({
              channel: pubNubSettings.channels[0],
              message: {
                text:text,
                name:this.name
              }
            });
          if(typeof clear == 'function') clear();
        }
      }
    });

    // Init App
    new Vue({
      el: '#app',
      // Init Framework7 by passing parameters here
      data: function(){
        return states;
      },
      methods:{
        enterChat: function(){
          if(this.name.trim().length === 0){
            alert("Enter your name!");
            return false;
          }

          this.msgs.length = 0;
          this.$f7.mainView.router.load({url:'/chat/'});
          initPubNub();
        }
      },
      framework7: {
        root: '#app',
        /* Uncomment to enable Material theme: */
        // material: true,
        routes: [
          {
            path: '/chat/',
            component: 'page-chat'
          }
        ],
      }
    });
  }

  // Handle device ready event
  // Note: You may want to check out the vue-cordova package on npm for cordova specific handling with vue - https://www.npmjs.com/package/vue-cordova
  document.addEventListener('deviceready', init, false);
})();
