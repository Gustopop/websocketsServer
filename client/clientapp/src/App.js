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


            console.log(("Am setat playerid: " + data.playerID));

            if (data.type === 'chat') {
                setPlayerId(data.playerID);
                setChatHistory((prev) => [...prev, {playerid: data.playerID, message: data.chatMsg}]);
            }

            if (data.type === 'nameChange'){
                console.log("Am primittttt numele :"+ data.playerID);
                setPlayerId(data.playerID);
                setChatHistory((prev) => [...prev, {playerid: 'SYSTEM', message: `Player ${data.prevID} changed their name to ${data.playerID}`}]);
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
            setUsername(username);
            setShowMenu(false);
            socket.send(JSON.stringify({type: 'nameChange', message: username}));
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


    return (
        <div className="body">
            <div className="body-chat">
                <div className="chat-container">
                <div className="chat-box">
                    <h1 className="chat-box-header">Ce naiba</h1>
                    <button className="menu-toggle" onClick={toggleMenu}>⚙️</button>
                    <ul className="chat-history" ref={chatHistoryRef}>
                        {chatHistory.map((item, index) => (
                            <li key={index} className="chat-history-item">
                                <span className="player-id">{'Player ' + item.playerid}: </span>
                                <span className="message">{item.message}</span>
                            </li>
                        ))}
                    </ul>
                    <form className="chat-form" onSubmit={handleSubmit}>
                        <input
                            className="chat-input"
                            type="text"
                            placeholder="Enter your message"
                            aria-label="Enter your message"
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                        />

                    </form>

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
                    <h2 style={{textAlign: "center", color: "white"}}>Raspunde la urmatoarea antrebare</h2>
                    <h2 style={{textAlign: "center", color: "white"}}>{question}</h2>

                    <div style={{display: "flex", alignItems: "flex-start"}}>
                        <div className="col-md-4">
                            <div className="banner">
                                <div className="card-body">
                                    <h5 className="card-title">Left Banner</h5>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="bannerCenter">
                                <div className="card-body">
                                    <div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="answer" id="answer1" value="Paris" onChange={(event) => setAnswer(event.target.value)} />
                                            <label className="form-check-label" htmlFor="answer1">
                                                Paris
                                            </label>
                                        </div>

                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="answer" id="answer2" value="Mata" onChange={(event) => setAnswer(event.target.value)} />
                                            <label className="form-check-label" htmlFor="answer2">
                                                Mata
                                            </label>
                                        </div>

                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="answer" id="answer3" value="Muie" onChange={(event) => setAnswer(event.target.value)} />
                                            <label className="form-check-label" htmlFor="answer3">
                                                Muie
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="banner">
                                <div className="card-body">
                                    <h5 className="card-title">Right Banner</h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <button className="btn btn-primary test" onClick={submitAnswer}>Submit</button>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default QuizGame;