const socketio = require("socket.io");
const mongoose = require("mongoose");
const events = require("events");
const _ = require("lodash");
const eventEmitter = new events.EventEmitter();

//adding db models
require("../app/models/user.js");
require("../app/models/chat.js");
require("../app/models/room.js");

//using mongoose Schema models
const userModel = mongoose.model("User");
const chatModel = mongoose.model("Chat");
const roomModel = mongoose.model("Room");

//reatime magic begins here

module.exports.sockets = function(http) {
  // io = socketio.listen(http);
  const io = require('socket.io')(http);
  //setting chat route
  const ioChat = io.of("/chat");
  const userStack = {};
  let oldChats, sendUserStack, setRoom;
  const userSocket = {};

  //socket.io magic starts here
  ioChat.on("connection", function(socket) {
    console.log("socketio chat connected.");
    //function to get user name
    socket.on("set-user-data", function(username) {
      console.log(username + "  logged In");
      // console.log(socket)
      //storing variable.
      socket.username = username;
      console.log(socket.username)
      userSocket[socket.username] = socket.id;
      console.log(userSocket)
      socket.broadcast.emit("broadcast", {
        description: username + " Logged In"
      });
      
      
      //getting all users list
      eventEmitter.emit("get-all-users");

      //sending all users list. and setting if online or offline.
      sendUserStack = function() {
        for (i in userSocket) {
          for (j in userStack) {
            if (j == i) {
              userStack[j] = "Online";
            }
          }
        }
        //for popping connection message.
        ioChat.emit("onlineStack", userStack);
      }; //end of sendUserStack function.
    }); //end of set-user-data event.

    //setting room.
    socket.on("set-room", function(room) {
      //   socket.emit('set-room',{name1:currentRoom,name2:reverseRoom}); 
      // truyền vào data : {name1 : currentRoom , name2 : reverseRoom }
      //leaving room.
      socket.leave(socket.room);
      console.log("vào đây ")
      //getting room data.
      eventEmitter.emit("get-room-data", room);
      //setting room and join.
      setRoom = function(roomId) {
        socket.room = roomId;
        console.log("roomId : " + socket.room);
        socket.join(socket.room);
        console.log("id người dùng ",userSocket[socket.username])
        console.log("id room from server", socket.room)
        ioChat.to(userSocket[socket.username]).emit("set-room", socket.room);
      };
    }); //end of set-room event.

    socket.on("old-chats-init", function(data) {
        eventEmitter.emit("read-chat", data);
      });

    oldChats = function(result, username, room) {
        ioChat.to(userSocket[username]).emit("old-chats", {
          result: result,
          room: room
        });
    };

     //for showing chats.
     socket.on("chat-msg", function(data) {
      //emits event to save chat to database.
      eventEmitter.emit("save-chat", {
        msgFrom: socket.username,
        msgTo: data.msgTo,
        msg: data.msg,
        room: socket.room,
        date: data.date
      });
      //emits event to send chat msg to all clients.

      ioChat.to(socket.room).emit("chat-msg", {
        msgFrom: socket.username,
        msg: data.msg,
        date: data.date
      });
    });

    //for popping disconnection message.
    socket.on("disconnect", function() {
      console.log(socket.username + "  logged out");
      socket.broadcast.emit("broadcast", {
        description: socket.username + " Logged out"
      });

      console.log("chat disconnected.");

      _.unset(userSocket, socket.username);
      userStack[socket.username] = "Offline";

      ioChat.emit("onlineStack", userStack);
    }); //end of disconnect event.
   
   

    // lắng nghe sự kiện call video 


    socket.on("call-user", (data) => {
      console.log("Gọi đến user : "+data.to+" có id : "+userSocket[data.to] + " from user : "+socket.username + "  có id : "+ userSocket[socket.username]+" == "+socket.id)
      socket.to(userSocket[data.to]).emit("call-made", {
        offer: data.offer,
        socket: socket.id,
        caller:socket.username
      });
    });

    socket.on("send-ice", (data) => {
      console.log("gửi ice đến : "+data.to)
      socket.to(userSocket[data.to]).emit("recever-ice", {
        ice: data.ice
      });

    });




    // lắng nghe phản hồi từ người nghe

    socket.on("make-answer", data => {
      console.log("dữ liệu nhận đc từ user : " , data.to)
      console.log("dữ liệu nhận đc từ user" , data)
      socket.to(data.to).emit("answer-made", {
        socket: socket.id ,
        answer: data.answer
      });
    });
    
    // trong trường hợp người nghe không bắt máy 
    //ioChat.to(socket.room) 
    socket.on("reject-call", data => {
      socket.to(data.from).emit("call-rejected", {
        socket: socket.id
      });
    });



    // sự kiện vdeo call

  //   socket.on('call', (data) => {
  //     let callee = data.name;
  //     let rtcMessage = data.rtcMessage;
  //     console.log("dữ liệu cuộc gọi từ :"+socket.username+"- id : "+userSocket[socket.username]+" đến : "+callee+" - id : "+ userSocket[callee])
  //     ioChat.to(userSocket[callee]).emit("newCall", {
  //         caller: userSocket[socket.username],
  //         rtcMessage: rtcMessage
  //     })

  // })

  // socket.on('answerCall', (data) => {
  //     let caller = data.caller;
  //     rtcMessage = data.rtcMessage

  //     ioChat.to(userSocket[caller]).emit("callAnswered", {
  //         callee:userSocket[socket.username] ,
  //         rtcMessage: rtcMessage
  //     })

  // })

  // socket.on('ICEcandidate', (data) => {
  //     let otherUser = data.user;
  //     let rtcMessage = data.rtcMessage;

  //     ioChat.to(userSocket[otherUser]).emit("ICEcandidate", {
  //         sender:userSocket[socket.username],
  //         rtcMessage: rtcMessage
  //     })
  // })

  }); //end of io.on(connection).
  //end of socket.io code for chat feature.
 
  //database operations are kept outside of socket.io code.
  //saving chats to database.
  eventEmitter.on("save-chat", function(data) {
    // var today = Date.now();

    var newChat = new chatModel({
      msgFrom: data.msgFrom,
      msgTo: data.msgTo,
      msg: data.msg,
      room: data.room,
      createdOn: data.date
    });

    newChat.save(function(err, result) {
      if (err) {
        console.log("Error : " + err);
      } else if (result == undefined || result == null || result == "") {
        console.log("Chat Is Not Saved.");
      } else {
        console.log("Chat Saved.");
        //console.log(result);
      }
    });
  }); //end of saving chat.

  //reading chat from database.
  eventEmitter.on("read-chat", function(data) {
    console.log("id room dể tìm tin nhắn trong room",data.room)
    chatModel
      .find({})
      .where("room")
      .equals(data.room)
    
      .skip(data.msgCount)
      .lean()
  
      .exec(function(err, result) {
        if (err) {
          console.log("Error : " + err);
        } else {
          //calling function which emits event to client to show chats.

          oldChats(result, data.username, data.room);
        }
      });
  }); //end of reading chat from database.

  //listening for get-all-users event. creating list of all users.
  eventEmitter.on("get-all-users", function() {
    userModel
      .find({})
      .select("username")
      .exec(function(err, result) {
        if (err) {
          console.log("Error : " + err);
        } else {
          //console.log(result);
          for (var i = 0; i < result.length; i++) {
            userStack[result[i].username] = "Offline";
          }
          //console.log("stack "+Object.keys(userStack));
          sendUserStack();
        }
      });
  }); //end of get-all-users event.

  //listening get-room-data event.
  eventEmitter.on("get-room-data", function(room) {
    console.log("data_room",room)
    roomModel.find(
      {
        $or: [
          {
            name1: room.name1
          },
          {
            name1: room.name2
          },
          {
            name2: room.name1
          },
          {
            name2: room.name2
          }
        ]
      },
      function(err, result) {
        if (err) {
          console.log("Error : " + err);
        } else {
          if (result == "" || result == undefined || result == null) {
            var today = Date.now();

            newRoom = new roomModel({
              name1: room.name1,
              name2: room.name2,
              lastActive: today,
              createdOn: today
            });

            newRoom.save(function(err, newResult) {
              if (err) {
                console.log("Error : " + err);
              } else if (
                newResult == "" ||
                newResult == undefined ||
                newResult == null
              ) {
                console.log("Some Error Occured During Room Creation.");
              } else {
                console.log("vào đây")
                setRoom(newResult._id); //calling setRoom function.
              }
            }); //end of saving room.
          } else {
            console.log("có room rồi")
            var jresult = JSON.parse(JSON.stringify(result));
            setRoom(jresult[0]._id); //calling setRoom function.
          }
        } //end of else.
      }
    ); //end of find room.
  }); //end of get-room-data listener.


   


  return io;
};
