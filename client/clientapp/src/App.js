import React, { useState, useEffect } from 'react';
import "./App.css";

const socket = new WebSocket('ws://https://websocketsserver-hkhn-j8mc-master-fftxtxwyma-lz.a.run.app/');

function QuizGame() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [quizOver, setQuizOver] = useState(false);
  const [questNr, setQuestNr] = useState(0);

  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data.questNr);
      if (data.questNr) {
        console.log(data.questNr);
        setQuestNr(data.questNr);
        console.log(data.questNr);
      }
      if (data.question === 'quizOver') {
        setQuizOver(true);
        return;
      }
      setQuestion(data.question);
    };

    return () => {
      //socket.close();
      console.log("Asta inchide socketul??");
    };
  }, []);

  const submitAnswer = () => {
    socket.send(answer);
    setAnswer('');
    console.log(answer);
  };

  const reloadQuiz = () => {
    socket.send("reloadquiz");
    setQuizOver(false);
  }

  if (quizOver) {
    return (
        <div>
          <h2 style={{ textAlign: "center", color: "white"  }}>Quiz Over</h2>
          <h2 style={{ textAlign: "center", color: "white"  }}>Congratulations!</h2>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <button onClick={reloadQuiz}>Reload Quiz!</button>
          </div>
        </div>
    );
  }

  return (
      <div style={{ height: "900px"}}>
        <h2 style={{ textAlign: "center", color: "white" }}>Raspunde la urmatoarea antrebare</h2>
        <h2 style={{ textAlign: "center", color: "white"  }}>{question}</h2>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div class = "banner">
            Left Banner
          </div>


          <div class = "bannerCenter">

            <div>
              <input type="radio" id="answer1" name="answer" value="Rusia"
                     onChange={(event) => setAnswer(event.target.value)} />
              <label htmlFor="answer1">Rusia</label>
            </div>

            <div>
              <input type="radio" id="answer2" name="answer" value="Mata"
                     onChange={(event) => setAnswer(event.target.value)} />
              <label htmlFor="answer2">Mata</label>
            </div>

            <div>
              <input type="radio" id="answer3" name="answer" value="Muie"
                     onChange={(event) => setAnswer(event.target.value)} />
              <label htmlFor="answer3">Muie</label>
            </div>



          </div>


          <div class = "banner">
            Right Banner
          </div>


        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button class = "btn test" onClick={submitAnswer}>Submit</button>
        </div>


      </div>
  );
}

export default QuizGame;
