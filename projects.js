document.addEventListener('DOMContentLoaded', function() {
    // В реальном проекте здесь можно заменить заглушки на настоящие изображения
    // Имитация GIF для демонстрации
    const projectGifs = [
        {
            static: "flewe.png",
            gif: "flewe.gif"
        },
        {
            static: "placeholder2.png",
            gif: "placeholder2.gif"
        },
        {
            static: "placeholder3.png",
            gif: "placeholder3.png"
        }
    ];
    
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        const staticImg = card.querySelector('.static-img');
        const gifImg = card.querySelector('.gif-img');
        
        if (index < projectGifs.length) {
            staticImg.src = projectGifs[index].static;
            gifImg.src = projectGifs[index].gif;
        }
    });
});