import bot from './assets/bot.png';
import user from './assets/user.png';


const form = document.querySelector('form');
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element){
 element.textContent = ' ';

 loadInterval = setInterval(()=> {
  element.textContent += '.';

  if(element.textContent === '....'){
    element.textContent = ' ';
  }
 }, 300)
}

function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
  if(index < text.length){
    element.innerHTML += text.charAt(index);
    index++;
  } else {
    clearInterval(interval);
  }
}, 20);
}

function generateID(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexString = randomNumber.toString(16);

  return `id-${timestamp}-${hexString}`;
}

function chatStripe(isAi, value, uniqueID) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
        <img 
          src=${isAi ? bot : user}
          alt="${isAi ? 'bot' : 'user'}" 
        />
        </div>
          <div class="message" id=${uniqueID}>${value}</div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  //bot's chatstripe
  const uniqueID = generateID();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueID);
  
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);

  loader(messageDiv);

  //fetch data from server

  const response = await fetch('http://localhost:5000',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13) {
    handleSubmit(e);
  }
})
