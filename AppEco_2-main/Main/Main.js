import '../Api/Components/DragGroup/DragGroup.js';



let audio = document.querySelector('audio');
let dragGroup = document.querySelector('x-draggroup');
let screen_finally = document.querySelector('.finally');

dragGroup.addEventListener('finally', (event) => {
  audio.play();
  setTimeout(() => {
    screen_finally.style.display = 'grid';
  }, 1000)
  
});

