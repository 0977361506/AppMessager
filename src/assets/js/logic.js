$(document).ready(function(){
let isAlreadyCalling = false;

let getCalled = false;

const existingCalls = [];

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();
 
const socket = io.connect("localhost:3333"); 

socket.on("update_list_user_active",data=>{
    console.log(data) ;
    showListUserActive(data.users) ;
})

async function showListUserActive (users){

    await makeElementUserActive(users)
    // await callUser();
   
}

    async function makeElementUserActive(users){
        users.forEach(socketID => {
            var checkExistElemetActive = document.getElementById(socketID);
            if(!checkExistElemetActive){
                // var element = `
                //     <div class="row friend" id =`+socketID+` onClick ="callUser(this)" >
                //     <div class="col col-sm-10">
                //         <div class="d-flex">
                //             <div class="image-user">
                //                 <img src="https://scontent.fhan14-2.fna.fbcdn.net/v/t1.6435-1/cp0/p80x80/176368141_1193350064449159_5082408654114027829_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=7206a8&_nc_ohc=Zpn2S34cOicAX9d0Sx4&_nc_ht=scontent.fhan14-2.fna&oh=eefab7227b21d7d6f7be5d31985f31dd&oe=60FD41DD"
                //                 style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                //             </div>
                //             <div style="padding-left: 10px">
                            
                //                 <p style="font-size: .875rem; color: white; margin: 0px;">`+socketID+`</p>
                //                 <p style="font-size: 10px; color: white ; margin: 0px;">Đang hoạt động</p>
                //             </div>
                //         </div>
                //     </div>
                //     <div class="col col-sm-2">
                //         <img src="https://scontent.fhan14-2.fna.fbcdn.net/v/t1.6435-1/cp0/p80x80/176368141_1193350064449159_5082408654114027829_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=7206a8&_nc_ohc=Zpn2S34cOicAX9d0Sx4&_nc_ht=scontent.fhan14-2.fna&oh=eefab7227b21d7d6f7be5d31985f31dd&oe=60FD41DD"
                //         style="max-width:15px ; max-height :15px; border-radius: 50%;" />
                //     </div>
                // </div>
                // `
                // $("#left-content").append(element) ;
                createUserItemContainer(socketID)
                const userContainerEl = createUserItemContainer(socketID);
                const activeUserContainer = document.getElementById("left-content");
                activeUserContainer.appendChild(userContainerEl);
 
                
            }
        });
    }


    
    function createUserItemContainer(socketId) {
        const userContainerEl = document.createElement("div");

    
        userContainerEl.setAttribute("class", "row friend");
        userContainerEl.setAttribute("id", socketId);

        userContainerEl.innerHTML = ` 
        <div class="col col-sm-10">
            <div class="d-flex">
                <div class="image-user">
                    <img src="https://scontent.fhan14-2.fna.fbcdn.net/v/t1.6435-1/cp0/p80x80/176368141_1193350064449159_5082408654114027829_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=7206a8&_nc_ohc=Zpn2S34cOicAX9d0Sx4&_nc_ht=scontent.fhan14-2.fna&oh=eefab7227b21d7d6f7be5d31985f31dd&oe=60FD41DD"
                    style="max-width:40px ; max-height :40px; border-radius: 50%;" />
                </div>
                <div style="padding-left: 10px">
                
                    <p style="font-size: .875rem; color: white; margin: 0px;">`+socketId+`</p>
                    <p style="font-size: 10px; color: white ; margin: 0px;">Đang hoạt động</p>
                </div>
            </div>
        </div>
        <div class="col col-sm-2">
            <img src="https://scontent.fhan14-2.fna.fbcdn.net/v/t1.6435-1/cp0/p80x80/176368141_1193350064449159_5082408654114027829_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=7206a8&_nc_ohc=Zpn2S34cOicAX9d0Sx4&_nc_ht=scontent.fhan14-2.fna&oh=eefab7227b21d7d6f7be5d31985f31dd&oe=60FD41DD"
            style="max-width:15px ; max-height :15px; border-radius: 50%;" />
        </div>`;
    
 
    
        userContainerEl.addEventListener("click", () => {
        callUser(socketId);
        });
    
        return userContainerEl;
    }


    async function callUser(socketId) {
        
        // let socketId = $(e).attr("id");
        console.log(socketId)
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

        socket.emit("call-user", {
            offer,
            to: socketId
        });
    }


    
    socket.on("remove-user", ({ socketId }) => {
        const elToRemove = document.getElementById(socketId);
        if (elToRemove) {
          elToRemove.remove();
        }
      });
      
  socket.on("call-made", async data => {
        console.log(data)
        if (getCalled) {
        const confirmed = confirm(
            `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
        );
    
        if (!confirmed) {
            socket.emit("reject-call", {
            from: data.socket
            });
    
            return;
        }
        }
    
        await peerConnection.setRemoteDescription(
           new RTCSessionDescription(data.offer)
        );
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    
        socket.emit("make-answer", {
        answer,
        to: data.socket
        });
        getCalled = true;
  });
  
  socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  
    if (!isAlreadyCalling) {
      callUser(data.socket);
      isAlreadyCalling = true;
    }
  });
  
  
  
  
  socket.on("call-rejected", data => {
    alert(`User: "Socket: ${data.socket}" rejected your call.`);

  });
  
  peerConnection.ontrack = function({ streams: [stream] }) {
    const remoteVideo = document.getElementById("remote-video");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };
  
  navigator.getUserMedia(
    { video: true, audio: true },
    stream => {
      const localVideo = document.getElementById("local-video");
      if (localVideo) {
        localVideo.srcObject = stream;
      }
  
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    },
    error => {
      console.warn(error.message);
    }
  );
  





  




});
