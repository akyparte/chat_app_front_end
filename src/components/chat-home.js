import { useEffect, useState, useRef } from 'react';
import '../App.css';

function ChatHome(params) {
  const socket = params.socket;
  // const [stage, setStage] = useState('register-user');
  const [stage, setStage] = useState('register-user');

  let [inputs, setInputs] = useState({ username: '', friendname: '', message: '' });
  let [messageQueue, setMessageQueue] = useState([]);
  let [isTyping, setIsTyping] = useState(false);
  let [timeoutId, setTimeoutId] = useState();
  const inputsRef = useRef(inputs);
  const messageQueueRef = useRef(messageQueue);
  const isTypingRef = useRef(isTyping);
  const timeoutIdRef = useRef(timeoutId);


  const onChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    let newObj = { ...inputs, [name]: value };
    setInputs(newObj)
  }


  const sendName = () => {
    if (inputs.username) {
       if(inputs.username.length > 20){
         alert('username has max 20 characers limit')
      }else if(inputs.username.length < 6){
        alert('username should have min 6 characters')
     }else {
        socket.emit('send-name', inputs.username);
      }
    }
  }

  const inviteFriend = () => {
    if (inputs.username === inputs.friendname) {
      alert("Can't add you as a friend")
    } else {
      socket.emit('invite-friend', { userName: inputs.username, friendName: inputs.friendname });
    }
  }


  const exitSession = () => {
    socket.emit('exit-session', inputs.username);
    setStage('register-user');
  }


  const socketEvents = () => {
    socket.on('send-name', (result) => {
      console.log(inputs)
      if (result === true) {
        setStage('invite-friend')
      } else {
        alert('already taken by someone')
      }
    })

    socket.on('invite-friend', (result) => {
      console.log(inputs);
      if (result.status == 'friend-offline') {
        alert('User does not exist')
      } else if (result.status == 'accept-request') {
        if (window.confirm(`Do you want accept invitation from ${result.data.friendName}`)) {
          socket.emit('accept-request', { friendName: result.data.friendName, userName: inputsRef.current.username })
          setInputs({ ...inputsRef.current, friendname: result.data.friendName });
          setStage('start-chatting')
        } else {
          socket.emit('request-reject', result.data.friendName);
        }
      } else if (result.status == 'request-reject') {
        alert(`${result.data.friendName} rejected invitation`)
      } else if (result.status == 'approve-accept') {
        // setInputs({...inputs,friendname:result.data.friendName});
        setStage('start-chatting')
      }
    })

    socket.on('friend-gone', () => {
      setInputs({ username: '', friendname: '' })
      setMessageQueue([])
      setStage('register-user')
    })

    socket.on('typing', () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        setIsTyping(true);
        let id = setTimeout(() => {
          if (isTypingRef.current) {
            setIsTyping(false)
          }
        }, 2000);

        setTimeoutId(id);
      } else {
        setIsTyping(true);
        let id = setTimeout(() => {
          if (isTypingRef.current) {
            setIsTyping(false)
          }
        }, 2000);

        setTimeoutId(id);

      }
    })

    socket.on('receive-message', (message) => {
      setMessageQueue([...messageQueueRef.current, { friend: true, message: message, user: inputsRef.current.friendname }]);
    })

  }

  const sendMessage = () => {
    if (inputs.username.length) {
      socket.emit('send-message', { message: inputs.message, friendName: inputs.friendname });
      setMessageQueue([...messageQueue, { me: true, message: inputs.message, user: inputs.username }]);
      setInputs({ ...inputs, message: '' });

      let chats = document.getElementById('chat-box')

      chats.scrollTop = chats.scrollHeight;
    }
  }

  const sendMessageEnter = (e) => {
    if (inputs.message.length) {
      if (e.code == 'Enter') {
        sendMessage();
      }
    }

    if (e.code != 'Enter') {
      socket.emit('typing', inputs.friendname)
    }
  }


  useEffect(() => {
    socketEvents()
  }, [])

  useEffect(() => {
    inputsRef.current = inputs;
    messageQueueRef.current = messageQueue;
    isTypingRef.current = isTyping;
    timeoutIdRef.current = timeoutId;
  });

  return (
    <div className='main-frame'>

      {stage == 'register-user' && (<div className="get-info-container">
        <input placeholder="Enter name" name='username' onChange={onChange} value={inputs.username} />
        <button onClick={sendName}>
          Start chatting !
        </button>
      </div>)}

      {stage == 'invite-friend' && (<div className="get-info-container">
        <input placeholder="Enter friend name" name='friendname' onChange={onChange} value={inputs.friendname} />
        <button onClick={inviteFriend}>
          Invite friend !
        </button>
        <button onClick={exitSession}>
          Exit Session !
        </button>
      </div>)}

      {stage == 'start-chatting' && (<div className="chat-container">
        <div className='user-info'>
          <p>  friend: {inputs.friendname} </p>
          {isTyping ? <span> Typing...</span> : ''}
        </div>
        <div className='chats' id ='chat-box'>
          {messageQueue.length ? messageQueue.map((message) => {
            let className = message.me ? 'message-box right' : 'message-box left';
            return (<div className={className}>
              <span>{message.user}</span>
              <p> {message.message}</p>
            </div>)
          }) : ''}

        </div>
        <div className='send-message-box'>
          <input name='message' onChange={onChange} onKeyUp={sendMessageEnter} value={inputs.message} />
          <button onClick={sendMessage}  > Send Message</button>
        </div>
      </div>)}



    </div>
  );
}

export default ChatHome;
