const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0, 
};

const modeButtons = document.querySelector('#mode-buttons').addEventListener('click', handleMode);

let interval;

const mainButton = document.getElementById('btn-start');
    mainButton.addEventListener('click', () => {
    const { action } = mainButton.dataset;
    if(action === 'start'){
        startTimer();
    }else{
        stopTimer();
    }
});

function stopTimer(){
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'START';
    mainButton.classList.remove('active');
}

function getRemainingTime(endTime){
    const currentTime = Date.now(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);
    return{
        total,
        minutes,
        seconds
    };
}


function startTimer(){
    let { total } = timer.remainingTime;
    const endTime = Date.now(new Date()) + total * 1000;

    if(timer.mode === 'pomodoro') timer.sessions++;

    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(() =>{
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;

        if(total<= 0){
            clearInterval(interval);
        
            switch(timer.mode){
                case 'pomodoro':
                    if(timer.sessions % timer.longBreakInterval === 0){
                        switchMode('longBreak')
                    }else{
                        switchMode('shortBreak')
                    }
                    break;
                default :
                    switchMode('pomodoro')
                    break
            }
            startTimer();
        }
    }, 1000);
}

function updateClock(){
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('minutes');
    const sec = document.getElementById('seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
    document.title = `${minutes}:${seconds} - ${text}`;

    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function switchMode(mode){
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    document.querySelectorAll('button[data-mode]').forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document.getElementById('js-progress').setAttribute('max', timer.remainingTime.total);

    updateClock();
}

function handleMode(e){
    const { mode } = e.target.dataset;
    
    if(!mode) return;

    switchMode(mode);
    stopTimer();
}

document.addEventListener('DOMContentLoaded', () => {

    // Let's check if the browser supports notifications
  if ('Notification' in window) {
    // If notification permissions have neither been granted or denied
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // ask the user for permission
      Notification.requestPermission().then(function(permission) {
        // If permission is granted
        if (permission === 'granted') {
          // Create a new notification
          new Notification(
            'Awesome! You will be notified at the start of each session'
          );
        }
      });
    }
  }

    switchMode('pomodoro');
  });