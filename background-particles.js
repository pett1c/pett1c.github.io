// Скрипт для создания интерактивного фона с частицами
document.addEventListener('DOMContentLoaded', function() {
    // Создаем canvas для фона с точками
    const particlesCanvas = document.createElement('canvas');
    particlesCanvas.id = 'particles-canvas';
    document.body.insertBefore(particlesCanvas, document.body.firstChild);

    // Добавляем стили для canvas
    particlesCanvas.style.position = 'fixed';
    particlesCanvas.style.top = '0';
    particlesCanvas.style.left = '0';
    particlesCanvas.style.width = '100%';
    particlesCanvas.style.height = '100%';
    particlesCanvas.style.zIndex = '-2'; // Под visualization-canvas (у которого z-index = -1)

    const ctx = particlesCanvas.getContext('2d');
    
    // Получаем размеры окна
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Устанавливаем размер canvas
    particlesCanvas.width = width;
    particlesCanvas.height = height;
    
    // Массив цветов, соответствующий аудио-визуализатору
    const colors = [
        { r: 0, g: 210, b: 255 },   // Cyan
        { r: 30, g: 144, b: 255 },  // Dodger Blue
        { r: 65, g: 105, b: 225 },  // Royal Blue
        { r: 138, g: 43, b: 226 }   // Blue Violet
    ];
    
    // Массив для хранения частиц
    let particles = [];
    
    // Количество частиц (зависит от размера экрана)
    const particleCount = Math.floor(width * height / 10000);
    
    // Координаты курсора
    let mouseX = width / 2;
    let mouseY = height / 2;
    
    // Флаг движения мыши
    let isMouseMoving = false;
    
    // Радиус влияния мыши (уменьшен для меньшей чувствительности)
    const mouseRadius = 150;
    
    // Центр и радиус области аудио-визуализатора (чтобы избежать появления точек там)
    const visualizerCenterX = width / 2;
    const visualizerCenterY = height / 2;
    const visualizerRadius = Math.min(width, height) * 0.35; // Немного больше чем 0.3 из аудио-визуализатора
    
    // Обработчик движения мыши
    window.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        
        // Сбрасываем флаг через некоторое время
        setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    });
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        width = window.innerWidth;
        height = window.innerHeight;
        
        particlesCanvas.width = width;
        particlesCanvas.height = height;
        
        // Обновляем центр визуализатора
        visualizerCenterX = width / 2;
        visualizerCenterY = height / 2;
        
        // Пересоздаем частицы при изменении размера
        initParticles();
    });
    
    // Класс для частиц
    class Particle {
        constructor() {
            // Генерируем позицию, избегая области визуализатора
            this.generatePositionOutsideVisualizer();
            
            this.size = Math.random() * 2 + 0.5; // Размер от 0.5 до 2.5
            
            // Выбираем цвет из палитры
            const colorIndex = Math.floor(Math.random() * colors.length);
            this.color = colors[colorIndex];
            
            // Добавляем случайную яркость (от 0.2 до 0.8)
            this.brightness = 0.2 + Math.random() * 0.6;
            
            // Скорость движения
            this.vx = 0;
            this.vy = 0;
            
            // Начальная позиция для возвращения
            this.originalX = this.x;
            this.originalY = this.y;
            
            // Скорость возврата к начальной позиции
            this.returnSpeed = 0.01 + Math.random() * 0.02;
            
            // Пульсация
            this.pulseSize = this.size;
            this.pulseRate = 0.01 + Math.random() * 0.02;
            this.pulseOffset = Math.random() * Math.PI * 2;
            
            // Параметры для произвольного движения
            this.wanderStrength = 0.05 + Math.random() * 0.1;
            this.wanderSpeed = 0.001 + Math.random() * 0.003;
            this.wanderOffset = Math.random() * Math.PI * 2;
        }
        
        // Генерация позиции за пределами визуализатора
        generatePositionOutsideVisualizer() {
            let isInVisualizer = true;
            
            // Генерируем новые координаты, пока не окажемся вне визуализатора
            while (isInVisualizer) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                
                // Проверяем, не попадает ли точка в область визуализатора
                const dx = this.x - visualizerCenterX;
                const dy = this.y - visualizerCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > visualizerRadius) {
                    isInVisualizer = false;
                }
            }
        }
        
        // Обновление позиции
        update() {
            // Если мышь двигается и частица в радиусе действия
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (isMouseMoving && distance < mouseRadius) {
                // Рассчитываем отталкивание от курсора (уменьшена чувствительность)
                const force = (mouseRadius - distance) / mouseRadius * 0.5; // Уменьшен коэффициент с 2 до 0.5
                const angle = Math.atan2(dy, dx);
                
                // Отталкиваем частицу от курсора
                this.vx -= Math.cos(angle) * force;
                this.vy -= Math.sin(angle) * force;
            }
            
            // Добавляем произвольное движение (случайное блуждание)
            const time = Date.now() / 1000;
            this.vx += Math.sin(time * this.wanderSpeed + this.wanderOffset) * this.wanderStrength;
            this.vy += Math.cos(time * this.wanderSpeed + this.wanderOffset + 1.3) * this.wanderStrength;
            
            // Добавляем возвращение к исходной позиции
            this.vx += (this.originalX - this.x) * this.returnSpeed;
            this.vy += (this.originalY - this.y) * this.returnSpeed;
            
            // Применяем трение (увеличено для меньшей чувствительности)
            this.vx *= 0.92;
            this.vy *= 0.92;
            
            // Обновляем позицию
            this.x += this.vx;
            this.y += this.vy;
            
            // Проверяем, не попали ли мы в область визуализатора
            const dxVisualizer = this.x - visualizerCenterX;
            const dyVisualizer = this.y - visualizerCenterY;
            const distanceVisualizer = Math.sqrt(dxVisualizer * dxVisualizer + dyVisualizer * dyVisualizer);
            
            // Если оказались внутри визуализатора, отталкиваемся от центра
            if (distanceVisualizer < visualizerRadius) {
                const angleVisualizer = Math.atan2(dyVisualizer, dxVisualizer);
                const pushForce = (visualizerRadius - distanceVisualizer) / visualizerRadius * 2;
                
                this.x += Math.cos(angleVisualizer) * pushForce;
                this.y += Math.sin(angleVisualizer) * pushForce;
            }
            
            // Пульсация размера
            const pulseTime = Date.now() / 1000;
            this.pulseSize = this.size * (1 + 0.2 * Math.sin(pulseTime * this.pulseRate + this.pulseOffset));
        }
        
        // Отрисовка частицы
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.brightness})`;
            ctx.fill();
        }
    }
    
    // Инициализация частиц
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Функция анимации
    function animate() {
        // Полностью очищаем canvas для устранения следов
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Запускаем систему частиц
    initParticles();
    animate();
});