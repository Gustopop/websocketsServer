import React, {useState, useEffect, useRef} from 'react';
import "./App.css";
import {Button, Modal, notification} from 'antd';

const socket = new WebSocket('ws://localhost:8080');

function QuizGame() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [quizOver, setQuizOver] = useState(false);
    const [questNr, setQuestNr] = useState(0);

    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [playerId, setPlayerId] = useState('');
    const chatHistoryRef = useRef(null);

    const [showMenu, setShowMenu] = useState(false);
    const [username, setUsername] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const usernameRules = /^[a-zA-Z0-9]+$/;
    const [leftSide, setLeftSide] = useState('');
    const [rightSide, setRightSide] = useState('');


    const [clickedItems, setClickedItems] = useState(Array(16).fill(false));
    const [playerIds, setPlayerIds] = useState(Array(16).fill(''));
    const [prevName, setPrevName] = useState('');
    const [pfp, setPfp] = useState('');


    useEffect(() => {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            //console.log(data.questNr);

            if (data.questNr) {
                console.log(data.questNr);
                setQuestNr(data.questNr);
                console.log(data.questNr);
            }

            if (data.question === 'quizOver') {
                setQuizOver(true);
                return;
            }

            if (data.question) {
                setQuestion(data.question);
            }

            if (data.type === 'setID'){
                setPlayerId(data.playerID);
                if (data.playerID === 1){
                    setPfp('"url(https://www.clipartmax.com/png/middle/311-3112095_image-cute-wolf-stickers.png)"');
                }
                else if (data.playerID === 2){
                    setPfp('"url(https://img.favpng.com/4/14/1/paper-gray-wolf-sticker-png-favpng-0tKw6qXe0eNUHjVMZqRRSMK1r.jpg)"');
                }
                console.log(("Am setat playerid: " + data.playerID));
            }
            //console.log(("Am setat playerid: " + data.playerID));

            if (data.type === 'chat') {
                setPlayerId(data.playerID);
                setChatHistory((prev) => [...prev, {playerid: data.playerID, message: data.chatMsg}]);
            }

            if (data.type === 'nameChange'){
                console.log("Am primittttt numele :"+ data.playerID);
                setPlayerId(data.playerID);
                setChatHistory((prev) => [...prev, {playerid: 'SYSTEM', message: `Player ${data.prevID} changed their name to ${data.playerID}`}]);
            }

            if (data.type === 'itemChange') {
                setClickedItems(data.clickedItems);
                setPlayerIds(data.playerID);
            }

            if(data.type === 'itemOccupied'){
                setClickedItems(data.clickedItems);
                setPlayerIds(data.playerID);
            }




        };

        return () => {
            //socket.close();
            console.log("Asta inchide socketul??");
        };
    }, []);


    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);



    const submitAnswer = () => {
        socket.send(JSON.stringify({type: 'answer', message: answer}));
        setAnswer('');
        console.log(answer);
    };

    const reloadQuiz = () => {
        socket.send(JSON.stringify({type: 'message', message: "reloadquiz"}));
        setQuizOver(false);
    }

    if (quizOver) {
        return (
            <div>
                <h2 style={{textAlign: "center", color: "white"}}>Quiz Over</h2>
                <h2 style={{textAlign: "center", color: "white"}}>Congratulations!</h2>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <button onClick={reloadQuiz}>Reload Quiz!</button>
                </div>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.send(JSON.stringify({type: 'chat', message: chatMessage}));
        setChatMessage('');
    };


    function toggleMenu() {
        setShowMenu(!showMenu);
    }

    function handleUsernameChange(event) {
        setUsername(event.target.value);
    }

    function handleUsernameSubmit(event) {
        event.preventDefault();

        if (usernameRules.test(username)){

            console.log(`New username: ${username}`);
            // TODO: update username in chat app state
            setPrevName(playerId);
            setUsername(username);
            setShowMenu(false);
            socket.send(JSON.stringify({type: 'nameChange', message: username}));

            const newClickedItems = [...clickedItems];
            const newPlayerIds = [...playerIds];
            if (newPlayerIds.includes(prevName || playerId)) {
                const index2 = newPlayerIds.indexOf(playerId || prevName);
                newClickedItems[index2] = true;
                newPlayerIds[index2] = username;
                socket.send(JSON.stringify({type: 'itemChange', clickedItems: newClickedItems, playerID: newPlayerIds}));
            }

        }
        else{
            notification['error']({
                message: 'Invalid Username Settings',
            });
        }
    }


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleClick = (index) => {
        // Create a new copy of the clickedItems and playerIds arrays
        const newClickedItems = [...clickedItems];
        const newPlayerIds = [...playerIds];

        if (newClickedItems[index] === false) {
            if (newPlayerIds.includes(playerId)) {
                const index2 = newPlayerIds.indexOf(playerId);
                console.log(`You have already occupied item ${index2 + 1}!`);
                newClickedItems[index2] = false;
                newPlayerIds[index2] = '';
                socket.send(JSON.stringify({type: 'itemOccupied', clickedItems: newClickedItems, playerID: newPlayerIds, index: index2}));
            }
        }



        if (newClickedItems[index] === true) {
            notification['error']({
                message: 'Position already occupied!',
            });
        }
        else{
            // Toggle the value of the clicked item and set the playerId
            newClickedItems[index] = true;
            newPlayerIds[index] = playerId; // replace with the actual playerId

            // Update state
            setClickedItems(newClickedItems);
            setPlayerIds(newPlayerIds);
            socket.send(JSON.stringify({type: 'itemChange', clickedItems: newClickedItems, playerID: newPlayerIds, index: index}));
        }

    };



    return (
        <div className="body">
            <div className="body-chat">
                <div className="chat-container">
                <div className="chat-box">
                    <h1 className="chat-box-header1">Meniu mic</h1>
                    <h1 className="chat-box-header2">Lista roluri</h1>
                    <button className="menu-toggle" onClick={toggleMenu}>⚙️</button>
                    <div className="chat-box-content">
                        <ul className="chat-history" ref={chatHistoryRef}>
                            {chatHistory.map((item, index) => (
                                <li key={index} className="chat-history-item">

                                <span className={`${item.playerid === 'SYSTEM' ? 'system-message' : 'player-id'}`}>
                                {item.playerid === 'SYSTEM' ? 'Server message' : 'Player ' + item.playerid}:
                                </span>

                                    <span className={`message ${item.playerid === 'SYSTEM' ? 'system-message' : ''}`}>
                                {item.message}
                                </span>
                                </li>
                            ))}
                        </ul>
                        <form className="chat-form" onSubmit={handleSubmit}>
                            <input
                                className="chat-input"
                                type="text"
                                placeholder="Type your message"
                                aria-label="Type your message"
                                value={chatMessage}
                                onChange={e => setChatMessage(e.target.value)}
                            />

                        </form>
                    </div>


                    {showMenu && (
                        <div className= "menu">
                            <form onSubmit={handleUsernameSubmit}>
                                <label htmlFor="username-input">Change username:</label>
                                <input id="username-input" type="text" value={username} onChange={handleUsernameChange} />
                                <button type="submit">Submit</button>
                            </form>
                        </div>
                    )}

                </div>
                    </div>

                <div className="other-body">
                    {Array(16).fill().map((_, index) => (
                        <div
                            id = "pfp"
                            key={index}
                            className={`banner ${clickedItems[index] ? 'clicked' : ''}`}
                            onClick={() => handleClick(index)}
                        >
                            <div className="playername">{playerIds[index]}</div>
                        </div>
                    ))}
                    <div className="maincolo">Some menu for later</div>
                </div>
            </div>
        </div>

    );
}

export default QuizGame;