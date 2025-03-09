document.addEventListener('DOMContentLoaded', function() {
    // В реальном проекте здесь можно заменить заглушки на настоящие изображения
    // Имитация GIF для демонстрации
    const projectGifs = [
        {
            static: "flewe.png",
            gif: "flewe.gif"
        },
        {
            static: "https://via.placeholder.com/300x400/1a1a1a/333333?text=Project+2",
            gif: "https://via.placeholder.com/300x400/1a1a1a/00d2ff?text=Animated+Project+2"
        },
        {
            static: "https://via.placeholder.com/300x400/1a1a1a/333333?text=Project+3",
            gif: "https://via.placeholder.com/300x400/1a1a1a/00d2ff?text=Animated+Project+3"
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