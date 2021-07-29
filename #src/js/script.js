const buttonToggleMenu = document.querySelector('.header__toggle-menu');
const headerMenu = document.querySelector('.header__menu');


buttonToggleMenu.onclick = () => {
   headerMenu.classList.toggle('header__menu--show');
}