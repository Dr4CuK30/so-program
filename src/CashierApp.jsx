import { useState, useEffect, useRef } from "react";
import "./CashierApp.css";
import Chart from "./Chart";
const CashierApp = () => {
  const [users, setUsers] = useState([
    {
      Name: "Cajero",
      Transaction: Math.floor(Math.random() * 5) + 2,
      Priority: 0,
    },
  ]);
  const [blockedQueue, setBlockedQueue] = useState([]);
  const [isQueuing, setQueuing] = useState(true);
  const [numToAssign, setNextNum] = useState(1);
  const [time, setTime] = useState(0);
  const [isHandling, setHandling] = useState(true);
  const [handledUsers, setHandledUsers] = useState([]);
  const [clientHandled, setClientHandled] = useState(null);
  const [bloqueados, setBloqueados] = useState([]);
  const [timeBlocked, setTimeBlocked] = useState(3);

  const [principalQueue, setPrincipalQueue] = useState({
    users: users,
    blockedQueue: blockedQueue,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      let principalQueueCopy = { ...principalQueue };

      if (isQueuing) {
        principalQueueCopy.users = queueClient(principalQueueCopy.users);
      }
      if (isHandling) {
        setTime(time + 1);
        principalQueueCopy.users = handleClient(principalQueueCopy.users, principalQueueCopy.blockedQueue);
      }
      setPrincipalQueue(principalQueueCopy);
      setUsers(principalQueue.users);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [isQueuing, principalQueue, isHandling, time]);

  const canvasRefQueue = useRef(null);
  const canvasRefCurrent = useRef(null);
  const canvasRefLast = useRef(null);

  useEffect(() => {
    const dibujarBolitas = () => {
      const canvasQueue = canvasRefQueue.current;
      const ctxQueue = canvasQueue.getContext("2d");
      const canvasCurrent = canvasRefCurrent.current;
      const ctxCurrent = canvasCurrent.getContext("2d");
      const canvasLast = canvasRefLast.current;
      const ctxLast = canvasLast.getContext("2d");

      const radioBolita = 30;
      const distanciaEntreBolitas = 100;

      ctxQueue.clearRect(0, 0, canvasQueue.width, canvasQueue.height);
      ctxCurrent.clearRect(0, 0, canvasCurrent.width, canvasCurrent.height);
      ctxLast.clearRect(0, 0, canvasCurrent.width, canvasCurrent.height);
      // NEXT CLIENT
      const xCurrent = canvasCurrent.width / 2;
      const y = canvasQueue.height / 2;
      ctxCurrent.fillStyle = "#969696";
      ctxCurrent.beginPath();
      ctxCurrent.arc(xCurrent, y, radioBolita, 0, Math.PI * 2);
      ctxCurrent.fill();
      ctxCurrent.fillStyle = "#fff";
      const nameNextClient =
        clientHandled?.Name.toString() + "[" + clientHandled?.Transaction + "]";
      const textWidthCurrent = ctxCurrent.measureText(nameNextClient).width;
      const xTextoCurrent = xCurrent - textWidthCurrent / 2;
      const yTextoCurrent = y + 6;
      ctxCurrent.fillText(nameNextClient, xTextoCurrent, yTextoCurrent);
      // LAST CLIENT
      const xLast = canvasLast.width / 2;
      const yLast = canvasLast.height / 2;
      ctxLast.fillStyle = "#b80";
      ctxLast.beginPath();
      ctxLast.arc(xCurrent, y, radioBolita, 0, Math.PI * 2);
      ctxLast.fill();
      ctxLast.fillStyle = "#fff";
      const nameLastClient = users[users.length - 1]?.Name.toString();
      const textWidthLast = ctxLast.measureText(nameLastClient).width;
      const xTextLast = xLast - textWidthLast / 2;
      const yTextLast = yLast + 6;
      ctxLast.fillText(nameLastClient, xTextLast, yTextLast);
      // PRINCIPAL CAJERO
      for (const [i, user] of users.entries()) {
        const xQueue = radioBolita + i * distanciaEntreBolitas;
        const numeroCliente = `${user.Name} [${user.Transaction}]`;
        if (i === 0) {
          ctxQueue.fillStyle = "#b80000";
        } else if (i === 1) {
          ctxQueue.fillStyle = "#969696";
        } else if (i === users.length - 1) {
          ctxQueue.fillStyle = "#b80";
        } else {
          ctxQueue.fillStyle = "#000";
        }
        ctxQueue.beginPath();
        ctxQueue.arc(xQueue, y, radioBolita, 0, Math.PI * 2);
        ctxQueue.fill();
        ctxQueue.fillStyle = "#fff";
        const textoNumeroCliente = numeroCliente.toString();
        const textWidth = ctxQueue.measureText(textoNumeroCliente).width;
        const xTextoQueue = xQueue - textWidth / 2;
        const yTextoQueue = y + 6;
        ctxQueue.fillText(textoNumeroCliente, xTextoQueue, yTextoQueue);
        if (i < users.length - 1) {
          ctxQueue.beginPath();
          ctxQueue.moveTo(xQueue + radioBolita, y);
          ctxQueue.lineTo(xQueue + distanciaEntreBolitas - radioBolita, y);
          ctxQueue.strokeStyle = "#000";
          ctxQueue.lineWidth = 2;
          ctxQueue.stroke();
        }
        if (i === 0) {
          ctxQueue.beginPath();
          ctxQueue.moveTo(xQueue, y + radioBolita);
          ctxQueue.lineTo(xQueue, y + 50);
          ctxQueue.lineTo(
            xQueue + distanciaEntreBolitas * (users.length - 1),
            y + 50
          );
          ctxQueue.lineTo(
            xQueue + distanciaEntreBolitas * (users.length - 1),
            y
          );
          ctxQueue.strokeStyle = "#b80000";
          ctxQueue.lineWidth = 2;
          ctxQueue.stroke();
        }
      }
    };

    dibujarBolitas();
  }, [users]);

  function handleClient(usersCopy, blockedQueueCopy) {
    if (clientHandled) {

      if (blockedQueue.length > 0) {
        if (blockedQueue[0].TimeEndBlocked === time) {
          const newClient = blockedQueueCopy[0];
          usersCopy.push({
            Name: newClient.Name + "'",
            Transaction: newClient.Transaction,
            TimeOfArrival: newClient.TimeOfArrival,
            Priority: 1,
          });
          blockedQueue.splice(0, 1);
        }
      }

      usersCopy.sort((a, b) => {
        if (a.Priority === b.Priority) {
          return a.Transaction - b.Transaction;
        } else {
          return a.Priority - b.Priority;
        }
      });

      if (clientHandled.Transaction - (time - clientHandled.HandleStartTime) > usersCopy[1].Transaction) {
        const newClient = clientHandled;
        //blockedQueue.splice(0, 1);
        setHandledUsers([
          ...handledUsers,
          { ...clientHandled, FinishTime: time },
        ]);

        usersCopy.push({
          Name: newClient.Name + '*',
          Transaction: newClient.Transaction - (time - newClient.HandleStartTime),
          TimeOfArrival: newClient.TimeOfArrival,
          Priority: 1,
        });
        const newHandledClient = usersCopy[1];
        usersCopy.splice(1, 1);
        setClientHandled({
          ...newHandledClient,
          HandleStartTime: time,
        });
      }

      if (time - clientHandled.HandleStartTime === clientHandled.Transaction) {
        if (clientHandled.Name.includes("'")) {
          const newBloqueados = [...bloqueados].filter(
            (bloq) => !bloq.includes(clientHandled.Name.replaceAll("'", ""))
          );
          setBloqueados(newBloqueados);
        }

        usersCopy[0] = {
          ...usersCopy[0],
          Transaction: Math.floor(Math.random() * 5) + 2,
        };
        setHandledUsers([
          ...handledUsers,
          { ...clientHandled, FinishTime: time },
        ]);
        setClientHandled(null);
        if (users.length > 1) {
          const newHandledClient = usersCopy[1];
          usersCopy.splice(1, 1);
          setClientHandled({
            ...newHandledClient,
            HandleStartTime: time,
          });
        }
      } else if (
        time - clientHandled.HandleStartTime ===
        users[0].Transaction
      ) {

        const timeBloq = usersCopy[0].Transaction;
        const newBloqueados = [...bloqueados];
        newBloqueados.push(clientHandled.Name);
        setBloqueados(newBloqueados);
        usersCopy[0] = {
          ...usersCopy[0],
          Transaction: Math.floor(Math.random() * 5) + 2,
        };

        const exClientHandled = { ...clientHandled };
        setHandledUsers([
          ...handledUsers,
          { ...clientHandled, FinishTime: time },
        ]);
        setClientHandled(null);
        if (users.length > 1) {
          const newHandledClient = usersCopy[1];
          usersCopy.splice(1, 1);
          setClientHandled({
            ...newHandledClient,
            HandleStartTime: time,
          });

          blockedQueueCopy.push({
            Name: exClientHandled.Name,
            Transaction: exClientHandled.Transaction - timeBloq,
            TimeOfArrival: exClientHandled.TimeOfArrival,
            TimeStartBlocked: time,
            TimeEndBlocked: time + timeBlocked,
            Priority: 1,
          });

        } else {
          setClientHandled({
            Name: exClientHandled.Name + "'",
            Transaction: exClientHandled.Transaction - timeBloq,
            TimeOfArrival: exClientHandled.TimeOfArrival,
            HandleStartTime: time,
          });
        }
      }
    } else if (users.length > 1) {
      usersCopy[0] = {
        ...usersCopy[0],
        Transaction: Math.floor(Math.random() * 5) + 2,
      };
      const newHandledClient = usersCopy[1];
      usersCopy.splice(1, 1);
      setClientHandled({
        ...newHandledClient,
        HandleStartTime: time,
      });
    }
    return usersCopy;
  }

  function queueClient(usersCopy) {
    let newUsers = [...usersCopy];
    if (!clientHandled && users.length === 1) {
      newUsers[0] = {
        ...usersCopy[0],
        Transaction: Math.floor(Math.random() * 5) + 2,
      };
      setClientHandled({
        Name: "C" + numToAssign,
        Transaction: Math.floor(Math.random() * 9) + 1,
        TimeOfArrival: time,
        HandleStartTime: time,
      });
    } else {
      newUsers.push({
        Name: "C" + numToAssign,
        Transaction: Math.floor(Math.random() * 10) + 1,
        TimeOfArrival: time,
        Priority: 1,
      });
    }
    setNextNum(numToAssign + 1);
    return newUsers;
  }

  let queueingMessage = isQueuing
    ? "Detener encolamiento"
    : "Iniciar encolamiento";
  let handlingMessage = isHandling ? "Detener atención" : " Iniciar atención";
  function changeIsQueueing() {
    setQueuing(!isQueuing);
  }
  function changeIsHandling() {
    setHandling(!isHandling);
  }

  const handledRows = handledUsers.map((user) => {
    const tRetorno = user.FinishTime - user.TimeOfArrival;
    const rafaga = user.Transaction;
    return (
      <tr key={user.Name}>
        <td>{user.Name}</td>
        <td>{user.TimeOfArrival}</td>
        <td>{rafaga}</td>
        <td>{user.HandleStartTime}</td>
        <td>{user.FinishTime}</td>
        <td>{tRetorno}</td>
        <td>{tRetorno - (user.FinishTime - user.HandleStartTime)}</td>
      </tr>
    );
  });
  const currentRow = clientHandled ? (
    <tr>
      <td>{clientHandled.Name}</td>
      <td>{clientHandled.TimeOfArrival}</td>
      <td>{clientHandled.Transaction}</td>
      <td>{clientHandled.HandleStartTime}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  ) : (
    ""
  );
  const usersWithoutCashier = [...users];
  usersWithoutCashier.shift();
  const userRows = usersWithoutCashier.map((user) => {
    return (
      <tr key={user.Name}>
        <td>{user.Name}</td>
        <td>{user.TimeOfArrival}</td>
        <td>{user.Transaction}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    );
  });
  function changeQuantum() {
    setQuantum(Number(quantumInput));
  }

  function changeInputValue(e) {
    setQuantumInput(e.target.value);
  }
  const semaphoreMessage = clientHandled ? "Ocupado" : "Disponible";
  return (
    <div className='container'>
      <div className='data-container'>
        <div className='element'>
          <img src='' alt='' className='icon' />
          <div className='data'>
            <div className='client-queue'>
              Cajero
              <canvas ref={canvasRefQueue} width={1100} height={105}></canvas>
            </div>
          </div>
        </div>
        <hr />
        <div className='element'>
          <div className='data'>
            <div className='client-current'>
              Cliente actual (Se bloqueara en {users[0].Transaction})
              <div className='bolita'>
                <canvas
                  ref={canvasRefCurrent}
                  width={200}
                  height={100}
                ></canvas>
              </div>
            </div>
            <div className='client-current'>
              Ultimo cliente
              <div className='bolita'>
                <canvas ref={canvasRefLast} width={200} height={100}></canvas>
              </div>
            </div>
            <div className='text'></div>
          </div>
        </div>
        <hr />
        <div className='top-bar'>
          <button onClick={changeIsQueueing}>{queueingMessage}</button>
          <button onClick={changeIsHandling}>{handlingMessage}</button>
          <button
            style={{
              backgroundColor: clientHandled ? "red" : "green",
            }}
          >
            {semaphoreMessage}
          </button>
          {/* <input value={transactions} onChange={changeTransactions} /> */}
        </div>
        <Chart
          usersData={users}
          clientHandled={clientHandled}
          time={time}
          handledUsers={handledUsers}
        />
        <p className='bloqueados'>
          Cola Bloqueados: {bloqueados.map((bloq) => bloq + ", ")}
        </p>
        <div>
          <table>
            <thead>
              <tr>
                <td>Proceso</td>
                <td>T. LLegada</td>
                <td>Rafaga</td>
                <td>T. Comienzo</td>
                <td>T. Final</td>
                <td>T. Retorno</td>
                <td>T. Espera</td>
              </tr>
            </thead>
            <tbody>
              {handledRows}
              {currentRow}
              {userRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashierApp;
