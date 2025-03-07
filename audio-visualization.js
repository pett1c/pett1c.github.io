document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const playButton = document.getElementById('play-button');
    const audio = document.getElementById('background-music');
    const canvas = document.getElementById('visualization-canvas');
    const ctx = canvas.getContext('2d');
    
    // Настраиваем размер канваса
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Состояние воспроизведения
    let isPlaying = false;
    
    // Web Audio API компоненты
    let audioContext;
    let analyser;
    let audioSource;
    let dataArray;
    let bufferLength;
    
    // Параметры визуализации
    let animationId = null;
    const numPoints = 200; // Количество точек в визуализации
    
    // Инициализация Web Audio API
    function initAudio() {
        // Создаем аудио контекст
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Создаем анализатор
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024; // Степень детализации анализа (должна быть степенью 2)
        bufferLength = analyser.frequencyBinCount; // Получаем половину fftSize
        dataArray = new Uint8Array(bufferLength); // Создаем массив для хранения данных
        
        // Создаем источник из элемента audio
        audioSource = audioContext.createMediaElementSource(audio);
        
        // Подключаем источник к анализатору, а анализатор к выходу
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }
    
    // Функция для рисования визуализации
    function drawVisualization() {
        // Очищаем канвас
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Получаем данные частот
        analyser.getByteFrequencyData(dataArray);
        
        // Определяем параметры визуализации
        const centerY = canvas.height / 2;
        const maxHeight = canvas.height * 0.2; // Максимальная высота волны
        const pointSpacing = canvas.width / (numPoints - 1);
        
        // Рисуем волну на основе данных аудио
        ctx.beginPath();
        
        for (let i = 0; i < numPoints; i++) {
            // Определяем, какие частоты использовать из dataArray для каждой точки
            const frequencyIndex = Math.floor(i * (bufferLength / numPoints));
            
            // Нормализуем значение от 0 до 1
            const normalizedValue = dataArray[frequencyIndex] / 255;
            
            // Применяем нелинейное масштабирование для более естественного вида
            const scaledValue = Math.pow(normalizedValue, 0.8) * maxHeight;
            
            // Добавляем эффект затухания на краях
            const edgeFade = Math.sin((i / numPoints) * Math.PI);
            
            // Вычисляем позицию точки
            const x = i * pointSpacing;
            const y = centerY - (scaledValue * edgeFade);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                // Используем кривые Безье для сглаживания линии
                const prevX = (i - 1) * pointSpacing;
                const prevY = centerY - (scaledValue * edgeFade);
                const cp1x = prevX + (x - prevX) / 3;
                const cp2x = prevX + 2 * (x - prevX) / 3;
                
                ctx.bezierCurveTo(
                    cp1x, prevY, 
                    cp2x, y, 
                    x, y
                );
            }
        }
        
        // Устанавливаем стиль для линии
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Продолжаем анимацию если воспроизведение активно
        if (isPlaying) {
            animationId = requestAnimationFrame(drawVisualization);
        }
    }
    
    // Создаем зеркальную волну (для использования в режиме ожидания)
    function drawIdleVisualization() {
        // Очищаем канвас
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Определяем параметры визуализации
        const centerY = canvas.height / 2;
        const visualizationHeight = canvas.height * 0.05; // Меньшая амплитуда для состояния ожидания
        const pointSpacing = canvas.width / (numPoints - 1);
        const time = Date.now() * 0.001;
        
        // Рисуем волну
        ctx.beginPath();
        
        for (let i = 0; i < numPoints; i++) {
            const normalizedPos = i / numPoints;
            
            // Создаем простую волну с меньшей амплитудой
            let value = Math.sin(normalizedPos * 10 + time * 1.0) * 0.3;
            value += Math.sin(normalizedPos * 5 + time * 0.5) * 0.2;
            
            // Эффект затухания на краях
            const edgeFade = Math.sin(normalizedPos * Math.PI);
            
            const x = i * pointSpacing;
            const y = centerY - (value * visualizationHeight * edgeFade);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        // Устанавливаем стиль для линии
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // Более прозрачный для режима ожидания
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Продолжаем анимацию состояния ожидания
        if (!isPlaying) {
            animationId = requestAnimationFrame(drawIdleVisualization);
        }
    }
    
    // Запускаем начальную визуализацию режима ожидания
    drawIdleVisualization();
    
    // Обработчик для кнопки воспроизведения
    playButton.addEventListener('click', function() {
        // При первом нажатии инициализируем Web Audio API
        if (!audioContext) {
            initAudio();
        }
        
        if (isPlaying) {
            // Пауза
            audio.pause();
            if (audioContext && audioContext.state === 'running') {
                audioContext.suspend();
            }
            cancelAnimationFrame(animationId);
            playButton.classList.remove('paused');
            isPlaying = false;
            
            // Запускаем визуализацию режима ожидания
            drawIdleVisualization();
        } else {
            // Воспроизведение
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            audio.play().then(() => {
                console.log('Аудио воспроизводится');
                isPlaying = true;
                playButton.classList.add('paused');
                
                // Останавливаем анимацию ожидания
                cancelAnimationFrame(animationId);
                
                // Запускаем визуализацию
                drawVisualization();
            }).catch(e => {
                console.error('Ошибка воспроизведения аудио:', e);
            });
        }
    });
    
    // Смена иконки кнопки при окончании воспроизведения
    audio.addEventListener('ended', function() {
        playButton.classList.remove('paused');
        isPlaying = false;
        if (audioContext && audioContext.state === 'running') {
            audioContext.suspend();
        }
        cancelAnimationFrame(animationId);
        
        // Запускаем визуализацию режима ожидания
        drawIdleVisualization();
    });
});