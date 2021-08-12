$ (function(){
    var socket = io('/chat');

    var username = $('#user').val();
    var noChat = 0; //setting 0 if all chats histroy is not loaded. 1 if all chats loaded.
    var msgCount = 0; //counting total number of messages displayed.
    var oldInitDone = 0; //it is 0 when old-chats-init is not executed and 1 if executed.
    var roomId;//variable for setting room.
    var toUser;


    // data for call video
    // const baseURL = "/"
    // let localVideo = document.querySelector('#local-video');
    // let remoteVideo = document.querySelector('#remote-video');

    let otherUser;
    // let remoteRTCMessage;

    // let iceCandidatesFromCaller = [];
    // let remoteStream;
    // let localStream;


    // let callInProgress = false;

    // code call video mới 

    let isAlreadyCalling = false;
    let getCalled = false;

    const existingCalls = [];

    const { RTCPeerConnection, RTCSessionDescription } = window;
    const ICE_SERVERS = {
        iceServers: [{
            urls: [ "stun:hk-turn1.xirsys.com" ]
         }, {
            username: "1AeBDJ1vWpkEk95GCEo6kNhiG5ObszFK97QVUF4XnsD1OaNDiPuZalFMVapHl8dbAAAAAGEUyl5oaWV1",
            credential: "f494f448-fb3c-11eb-ab55-0242ac120004",
            urls: [
                "turn:hk-turn1.xirsys.com:80?transport=udp",
                "turn:hk-turn1.xirsys.com:3478?transport=udp",
                "turn:hk-turn1.xirsys.com:80?transport=tcp",
                "turn:hk-turn1.xirsys.com:3478?transport=tcp",
                "turns:hk-turn1.xirsys.com:443?transport=tcp",
                "turns:hk-turn1.xirsys.com:5349?transport=tcp"
            ]
         }]
         
         
      };

    




    const peerConnection = new RTCPeerConnection(ICE_SERVERS);



    // end data for call video



    //passing data on connection.
    socket.on('connect',function(){
        socket.emit('set-user-data',username);
    });     
    
    socket.on("onlineStack",(userStack)=>{
        console.log(userStack)
        showUserConnect(userStack)
    })

    
    function showUserConnect(userStack){
        var data = '';
        for (var v in userStack){
            data+=`
            <div userName=`+v+` class="row friend" id="clickUser">
              <div class="col col-sm-10">
                  <div class="d-flex">
                      <div class="image-user">
                          <img src="https://study.vnpost.vn/static/images/user_techer.png"
                          style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                      </div>
                      <div style="padding-left: 10px">
                      
                          <p style="font-size: .875rem; color: white; margin: 0px;">`+v+`</p> `;
              if(userStack[v]=='Online') data+=` <p style="font-size: 10px; color: white ; margin: 0px;">Đang hoạt động</p>`  
              else data+= ` <p style="font-size: 10px; color: white ; margin: 0px;">Offline</p>`  
              data+= ` </div>
                  </div>
              </div>
              <div class="col col-sm-2">
                  <img src="https://study.vnpost.vn/static/images/user_techer.png"
                  style="max-width:15px ; max-height :15px; border-radius: 50%;" />
              </div>
          </div> `

        }
        
        $(".listUser").html(data)
    }

    socket.on("set-room",(roomid)=>{
      
       $(".contentchat").html("")
       roomId =roomid
       console.log("roomID from Server",roomId+username)
       socket.emit('old-chats-init',{room:roomId,username:username});

    })
    

    socket.on('old-chats',function(data){
        console.log(data)
        if(data.room == roomId){
           var dataMessage = ``;
           $(data.result).each(function(k,v){
               if(v.msgFrom!=username){
                  dataMessage+=` 
                    <div class="d-flex justify-content-start comment-user">
                        <div class="message">
                            <div class="d-flex">
                                <div class="image-user">
                                    <img src="https://study.vnpost.vn/static/images/user_techer.png"
                                    style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                                </div>
                                <div style="padding-left: 10px   ;  min-width: 400px;" class="list-comment-user" >
                                    <p class="message-f-user" >`+v.msg+` </p>
                                </div>
                        </div>
                        </div>
                    </div>`
               }else{
                   dataMessage+=`
                    <div class="d-flex justify-content-end comment-you">
                        <div class="message">
                            <div class="d-flex">
                                <!-- <div class="image-user">
                                    <img src="https://scontent.fhan14-2.fna.fbcdn.net/v/t1.6435-1/cp0/p80x80/176368141_1193350064449159_5082408654114027829_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=7206a8&_nc_ohc=Zpn2S34cOicAX9d0Sx4&_nc_ht=scontent.fhan14-2.fna&oh=eefab7227b21d7d6f7be5d31985f31dd&oe=60FD41DD"
                                    style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                                </div> -->
                                <div style="padding-left: 10px ; min-width: 400px;" class="list-comment-user">
                                    <p class="message-f-you">`+v.msg+`</p>
                            </div>
                        </div>
                        </div>
                   </div>
                   `
               }
           })

           $("#contentchat").html(dataMessage)
        }
    
      });
      
    socket.on("chat-msg",(v)=>{ 
        var  dataMessage =``
        if(v.msgFrom!=username){
            dataMessage+=` 
              <div class="d-flex justify-content-start comment-user">
                  <div class="message">
                      <div class="d-flex">
                          <div class="image-user">
                              <img src="https://study.vnpost.vn/static/images/user_techer.png"
                              style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                          </div>
                          <div style="padding-left: 10px   ;  min-width: 400px;" class="list-comment-user" >
                              <p class="message-f-user" >`+v.msg+` </p>
                          </div>
                  </div>
                  </div>
              </div>`
         }else{
             dataMessage+=`
              <div class="d-flex justify-content-end comment-you">
                  <div class="message">
                      <div class="d-flex">
                          <!-- <div class="image-user">
                              <img src="https://scontent.fhan14-2.fna.fbcdn.net/v/t1.6435-1/cp0/p80x80/176368141_1193350064449159_5082408654114027829_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=7206a8&_nc_ohc=Zpn2S34cOicAX9d0Sx4&_nc_ht=scontent.fhan14-2.fna&oh=eefab7227b21d7d6f7be5d31985f31dd&oe=60FD41DD"
                              style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                          </div> -->
                          <div style="padding-left: 10px ; min-width: 400px;" class="list-comment-user">
                              <p class="message-f-you">`+v.msg+`</p>
                      </div>
                  </div>
                  </div>
             </div>
             `
         }
       $("#sendMessage").val("");
       $("#contentchat").append(dataMessage)
    })
    

    
     // send file
    $("#sendAllFile").click(function(){
        $("#sendding").click();
        console.log("click send file")
    })

    
    
	document.querySelector("#sendding").addEventListener("change",function(e){
		let file = e.target.files[0];
		console.log(file.type)
		if(!file){
			return;		
		}
		let reader = new FileReader();
		reader.onload = function(e){
			let buffer = new Uint8Array(reader.result);


            socket.emit("file-meta", {
                metadata:{
                    filename: file.name,
                    total_buffer_size:buffer.length,
                    buffer_size:1024,
                    typeFile : file.type,
                    reader : reader.result,
                    buffer :buffer,
                    file :file
                }
            });
            
            // nhận dữ liệu file từ bên gửi lên cho server trả về
    
     
		}
		reader.readAsArrayBuffer(file);
	});

      
    socket.on("fs-meta",(data)=>{
    
        var  dataMessage =``
        var src = ``;
        var elementFile =``;
        console.log("loại dữ liêu" ,data.data.typeFile)
        if(data.data.typeFile=='image/jpeg' || data.data.typeFile=='image/jpg' ||data.data.typeFile=='image/gif' || data.typeFile==='image/png' || data.data.typeFile =='image/webp'){
            const blob = new Blob([data.data.reader], {type: 'image/png'});  // ảnh 
            console.log("ảnh")
            src += URL.createObjectURL(blob);
            console.log("src",src)
            elementFile +=`<img src=`+src.trim()+` style="max-width: 300px; max-height: 300px;" />`
        }else if(data.data.typeFile=='video/mp4' ||data.data.typeFile=='video/3gpp'|| data.data.typeFile=='video/webm' ||data.data.typeFile=='video/wmb'){
            let videoBlob = new Blob([data.data.buffer], { type: 'video/mp4' });
            src += window.URL.createObjectURL(videoBlob);
            console.log("src",src)
            elementFile+=`<video autoplay controls id="video" src=`+src.trim()+` style="max-width: 300px; max-height: 300px;"></video>`
        }else if (data.data.typeFile =='audio/mp3'|| data.data.typeFile =='audio/wav' ||  data.data.typeFile == 'audio/mpeg'){
            let audioBlob =null ;
            if(data.data.typeFile =='audio/wav'){
                audioBlob =new Blob([data.data.buffer], { type: "audio/wav" });
            }else {
                audioBlob =new Blob([data.data.buffer], { type: "audio/mp3" });
            }
            src += window.URL.createObjectURL(audioBlob);
            console.log("src",src)
            elementFile+=`<audio controls autoplay src=`+src.trim()+` style="max-width: 300px; max-height:80px;" />`
        }else {
            elementFile+=`<p style="color :white">`+data.data.filename+`</p>`
        }

        if(data.msgFrom!=username){

            dataMessage+=` 
              <div class="d-flex justify-content-start comment-user">
                  <div class="message">
                      <div class="d-flex">
                          <div class="image-user">
                              <img src="https://study.vnpost.vn/static/images/user_techer.png"
                              style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                          </div>
                          <div style="padding-left: 10px   ;  min-width: 400px;" class="list-comment-user" >
                             `+elementFile+`
                          </div>
                  </div>
                  </div>
              </div>`
         }else{
             dataMessage+=`
              <div class="d-flex justify-content-end comment-you">
                  <div class="message">
                      <div class="d-flex">
                          <!-- <div class="image-user">
                              <img src="https://scontent.fhan14-2.fna.fbcdn.net/v/t1.6435-1/cp0/p80x80/176368141_1193350064449159_5082408654114027829_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=7206a8&_nc_ohc=Zpn2S34cOicAX9d0Sx4&_nc_ht=scontent.fhan14-2.fna&oh=eefab7227b21d7d6f7be5d31985f31dd&oe=60FD41DD"
                              style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                          </div> -->
                          <div style="padding-left: 10px ; min-width: 400px;" class="list-comment-user">
                          `+elementFile+`
                      </div>
                  </div>
                  </div>
             </div>
             `
         }
       $("#sendMessage").val("");
       $("#contentchat").append(dataMessage)
    })

-
 
    // xử lí logic 

   

    $(document).on("click","#clickUser",function(){
        var name = $(this).attr("userName")
        $("#chatWithUser").html(name)
        toUser=name ;

        if(toUser == "Group"){
            var currentRoom = "Group-Group";
            var reverseRoom = "Group-Group";
          }
          else{
            var currentRoom = username+"-"+toUser;
            var reverseRoom = toUser+"-"+username;
          }
      
          //event to set room and join.
          socket.emit('set-room',{name1:currentRoom,name2:reverseRoom});
      
    })


    $("#sendMessage").keyup(function (event) {
        var data = $("#sendMessage").val();
        if (data != null && data != "") {
            if (event.which == 13) {
                socket.emit('chat-msg',{msg:data,msgTo:toUser,date:Date.now()});
            }
        }

    })

    
        
        //event from html
    $(document).on("click","#call",function(){
        let userToCall =   $("#chatWithUser").html() ;
        console.log("call với" ,userToCall)
        
        otherUser = userToCall;
        callUser(otherUser);

    })
    

    // thực hiện hàm gọi
    async function callUser(socketId) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
      
        socket.emit("call-user", {
          offer,
          to: socketId
        });
    }

    // trả về dữ liệu người gọi từ server

    socket.on("call-made", async data => {
      // if (getCalled) {
            const confirmed = confirm(
                `User " ${data.caller}" Muốn gọi cho bạn . Nghe máy ?`
            );
            if (!confirmed) {
                socket.emit("reject-call", {
                from: data.socket
                });
        
                return;
            }else{
                
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.offer)
                );

                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
                console.log("Người dung nghe máy tạo kết nối ")
                socket.emit("make-answer", {
                    answer,
                    to: data.socket
                });
            }
      //  }
      
       // getCalled = true;


    });
    
    socket.on("recever-ice",data=>{
       console.log("Nhận ice từ bên gọi")
       console.log("ice",data)
       let iceCandidate = new RTCIceCandidate(data.ice);
       peerConnection.addIceCandidate(iceCandidate).catch(err => console.log(err));
    })


    // nghe phản hồi từ server  ( xem nó có nghe máy mình không v: )

    socket.on("answer-made", async data => {
        console.log("dữ liueeuj cuối cung" , data)
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        
         // $("#modalCall").modal("show") // hiển thị video stream

        if (!isAlreadyCalling) {
          callUser(data.socket);
          isAlreadyCalling = true;
        }
    });
   

    $(document).on("click","#answer",function(){
        beReady()
        .then(bool => {
            processAccept();
            $('#modalCall').modal('show');
            $('#modalAnswer').modal('hide');
        })
    })
 

    peerConnection.onicecandidate = event => {
        
        if (event.candidate != null) {
            let userToCall =   $("#chatWithUser").html() ;
            console.log("call với" ,userToCall)
            
            otherUser = userToCall;
            console.log("send cho : "+otherUser)
            socket.emit("send-ice", {
                  ice: event.candidate,
                  to: otherUser
            });
        }
    };

    peerConnection.onaddstream = function( evt ) {
        
        remoteStream = evt.stream;
        const remoteVideo = document.getElementById("remoteVideo");
        if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
          remoteVideo.srcObject = remoteStream;
        }
    }
    // peerConnection.ontrack = event => {
    //     const stream = event.streams[0];
    //     const remoteVideo = document.getElementById("remoteVideo");
    //     if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
    //       remoteVideo.srcObject = stream;
    //     }
    // };

    navigator.getUserMedia(
        { video: true, audio: true },
        stream => {
        const localVideo = document.getElementById("localVideo");
        if (localVideo) {
            localVideo.srcObject = stream;
        }
    
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        peerConnection.addStream(stream);
        },
        error => {
        console.warn(error.message);
        }
    );


    // video call code lỗi trên server 



    // let pcConfig = {
    //     "iceServers":
    //         [
    //             { "url": "stun:stun.jap.bloggernepal.com:5349" },
    //             {
    //                 "url": "turn:turn.jap.bloggernepal.com:5349",
    //                 "username": "guest",
    //                 "credential": "somepassword"
    //             }
    //         ]
    // };

    // // Set up audio and video regardless of what devices are present.
    // let sdpConstraints = {
    //     offerToReceiveAudio: true,
    //     offerToReceiveVideo: true
    // };

    // /////////////////////////////////////////////



    // function sendCall(data) {
    //     //to send a call
    //     console.log("Send Call");
    //     console.log("data truyen cho ben nguoi nghe",data)
    //     socket.emit("call", data);
    // }



    // function answerCall(data) {
    //     //to answer a call
    //     socket.emit("answerCall", data);
    //     callProgress();
    // }

    // function sendICEcandidate(data) {
    //     //send only if we have caller, else no need to
    //     console.log("Send ICE candidate");
    //     socket.emit("ICEcandidate", data)
    // }

    // function beReady() {
    //     return navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //         video: true
    //     })
    //         .then(stream => {
    //             localStream = stream;
    //             localVideo.srcObject = stream;

    //             return createConnectionAndAddStream()
    //         })
    //         .catch(function (e) {
    //             alert('getUserMedia() error: ' + e.name);
    //         });
    // }

    // function createConnectionAndAddStream() {
    //     createPeerConnection();
    //     peerConnection.addStream(localStream);
    //     return true;
    // }

    // function processCall(userName) {
    //     peerConnection.createOffer((sessionDescription) => {
    //         peerConnection.setLocalDescription(sessionDescription);
    //         sendCall({
    //             name: userName,
    //             rtcMessage: sessionDescription
    //         })
    //     }, (error) => {
    //         console.log("Error");
    //     });
    // }

    // function processAccept() {
    //     console.log(remoteRTCMessage)
    //     peerConnection.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage));
    //     peerConnection.createAnswer((sessionDescription) => {
    //         peerConnection.setLocalDescription(sessionDescription);

    //         if (iceCandidatesFromCaller.length > 0) {
    //             //I am having issues with call not being processed in real world (internet, not local)
    //             //so I will push iceCandidates I received after the call arrived, push it and, once we accept
    //             //add it as ice candidate
    //             //if the offer rtc message contains all thes ICE candidates we can ingore this.
    //             for (let i = 0; i < iceCandidatesFromCaller.length; i++) {
    //                 //
    //                 let candidate = iceCandidatesFromCaller[i];
    //                 console.log("ICE candidate Added From queue");
    //                 try {
    //                     peerConnection.addIceCandidate(candidate).then(done => {
    //                         console.log(done);
    //                     }).catch(error => {
    //                         console.log(error);
    //                     })
    //                 } catch (error) {
    //                     console.log(error);
    //                 }
    //             }
    //             iceCandidatesFromCaller = [];
    //             console.log("ICE candidate queue cleared");
    //         } else {
    //             console.log("NO Ice candidate in queue");
    //         }

    //         answerCall({
    //             caller: otherUser,
    //             rtcMessage: sessionDescription
    //         })

    //     }, (error) => {
    //         console.log("Error");
    //     })
    // }

    // /////////////////////////////////////////////////////////

    // function createPeerConnection() {
    //     try {
    //         peerConnection = new RTCPeerConnection(pcConfig);
    //         // peerConnection = new RTCPeerConnection();
    //         peerConnection.onicecandidate = handleIceCandidate;
    //         peerConnection.onaddstream = handleRemoteStreamAdded;
    //         peerConnection.onremovestream = handleRemoteStreamRemoved;
    //         console.log('Created RTCPeerConnnection');
            
    //         return;
    //     } catch (e) {
    //         console.log('Failed to create PeerConnection, exception: ' + e.message);
    //         alert('Cannot create RTCPeerConnection object.');
    //         return;
    //     }
    // }

    // function handleIceCandidate(event) {
    //     // console.log('icecandidate event: ', event);
    //     if (event.candidate) {
    //         console.log("Local ICE candidate");
    //         // console.log(event.candidate.candidate);
    //         console.log("otherUser",otherUser)
    //         sendICEcandidate({
    //             user:otherUser,
    //             rtcMessage: {
    //                 label: event.candidate.sdpMLineIndex,
    //                 id: event.candidate.sdpMid,
    //                 candidate: event.candidate.candidate
    //             }
    //         })

    //     } else {
    //         console.log('End of candidates.');
    //     }
    // }

    // function handleRemoteStreamAdded(event) {
    //     console.log('Remote stream added.');
    //     remoteStream = event.stream;
    //     remoteVideo.srcObject = remoteStream;
    // }



    // function handleRemoteStreamRemoved(event) {
    //     console.log('Remote stream removed. Event: ', event);
    //     remoteVideo.srcObject = null;
    //     localVideo.srcObject = null;
    // }

    // window.onbeforeunload = function () {
    //     if (callInProgress) {
    //         stop();
    //     }
    // };


    // function stop() {
    //     localStream.getTracks().forEach(track => track.stop());
    //     callInProgress = false;
    //     peerConnection.close();
    //     peerConnection = null;
    //     document.getElementById("call").style.display = "block";
    //     document.getElementById("answer").style.display = "none";
    //     document.getElementById("inCall").style.display = "none";
    //     document.getElementById("calling").style.display = "none";
    //     document.getElementById("endVideoButton").style.display = "none"
    //     otherUser = null;
    // }

    // function callProgress() {

    //     // document.getElementById("videos").style.display = "block";
    //     // document.getElementById("otherUserNameC").innerHTML = otherUser;
    //     // document.getElementById("inCall").style.display = "block";

    //     callInProgress = true;
    // }

})




// xử lý call video 




