// Функция для создания контрола громкости
function createVolumeControl(audioElement) {
	// Создаем контейнер для контрола
	const controlContainer = document.createElement('div');
	controlContainer.className = 'volume-control';
	
	// Создаем подпись
	const label = document.createElement('div');
	label.className = 'volume-label';
	label.textContent = 'Volume';
	
	// Создаем слайдер
	const slider = document.createElement('input');
	slider.type = 'range';
	slider.min = '0';
	slider.max = '100';
	slider.value = '80'; // Начальное значение громкости 80%
	slider.className = 'volume-slider';
	
	// Создаем отображение текущего значения
	const valueDisplay = document.createElement('div');
	valueDisplay.className = 'volume-value';
	valueDisplay.textContent = slider.value + '%';
	
	// Добавляем элементы в контейнер
	controlContainer.appendChild(label);
	controlContainer.appendChild(slider);
	controlContainer.appendChild(valueDisplay);
	
	// Добавляем стили
	const style = document.createElement('style');
	style.textContent = `
		.volume-control {
			position: fixed;
			top: 120px;
			left: 40px;
			background-color: rgba(26, 26, 26, 0.7);
			border: 1px solid rgba(177, 78, 255, 0.4);
			border-radius: 10px;
			padding: 15px;
			z-index: 100;
			color: white;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			display: flex;
			flex-direction: column;
			gap: 8px;
			backdrop-filter: blur(5px);
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			transition: opacity 0.3s ease;
			opacity: 0.7;
			width: 200px;
		}
		
		.volume-control:hover {
			opacity: 1;
		}
		
		.volume-label {
			font-size: 14px;
			color: rgba(255, 255, 255, 0.9);
			margin-bottom: 5px;
			font-weight: 300;
		}
		
		.volume-value {
			font-size: 12px;
			color: rgba(177, 78, 255, 0.9);
			text-align: right;
			font-weight: 500;
		}
		
		.volume-slider {
			-webkit-appearance: none;
			appearance: none;
			width: 100%;
			height: 4px;
			background: rgba(255, 255, 255, 0.2);
			outline: none;
			border-radius: 2px;
			margin: 10px 0;
		}
		
		.volume-slider::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: rgba(177, 78, 255, 0.8);
			cursor: pointer;
			box-shadow: 0 0 5px rgba(177, 78, 255, 0.5);
			transition: all 0.2s ease;
		}
		
		.volume-slider::-moz-range-thumb {
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: rgba(177, 78, 255, 0.8);
			cursor: pointer;
			box-shadow: 0 0 5px rgba(177, 78, 255, 0.5);
			border: none;
			transition: all 0.2s ease;
		}
		
		.volume-slider::-webkit-slider-thumb:hover,
		.volume-slider::-moz-range-thumb:hover {
			background: rgba(177, 78, 255, 1);
			box-shadow: 0 0 10px rgba(177, 78, 255, 0.8);
			transform: scale(1.1);
		}
		
		.volume-slider::-webkit-slider-runnable-track,
		.volume-slider::-moz-range-track {
			border-radius: 2px;
		}
		
		@media (max-width: 768px) {
			.volume-control {
				top: 100px;
				left: 20px;
				padding: 10px;
				width: 160px;
			}
		}
	`;
	
	// Устанавливаем начальную громкость
	audioElement.volume = parseFloat(slider.value) / 100;
	
	// Добавляем обработчик событий для слайдера
	slider.addEventListener('input', function() {
		// Обновляем только gainNode, НЕ обновляем audioElement.volume
		const volume = parseFloat(this.value) / 100;
		
		if (gainNode && audioContext) {
			gainNode.gain.value = volume;
		}
		
		valueDisplay.textContent = this.value + '%';
	});
	
	// Добавляем стили и контейнер в документ
	document.head.appendChild(style);
	document.body.appendChild(controlContainer);
}document.addEventListener('DOMContentLoaded', function() {
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
let splitter;
let analyserLeft;
let analyserRight;
let audioSource;
let dataArrayLeft;
let dataArrayRight;
let bufferLength;
let gainNode; // Ноду для управления громкостью

// Параметры визуализации
let animationId = null;
let rotationAngle = 0; // Угол вращения в радианах
let rotationSpeed = 0.003; // Скорость вращения (радиан за кадр)
const defaultRotationSpeed = 0.003; // Начальная скорость вращения

// История точек для эффекта следа
const trailLength = 30;
const trailHistory = [];

// Функция для создания объединенных контролов
function createCombinedControls(audioElement) {
	// Создаем контейнер для контрола
	const controlContainer = document.createElement('div');
	controlContainer.className = 'controls-container';
	
	// === ROTATION SPEED CONTROL ===
	// Создаем подпись для скорости вращения
	const speedLabel = document.createElement('div');
	speedLabel.className = 'control-label speed-label';
	speedLabel.textContent = 'rotation speed';
	
	// Создаем слайдер скорости
	const speedSlider = document.createElement('input');
	speedSlider.type = 'range';
	speedSlider.min = '0';
	speedSlider.max = '100';
	speedSlider.value = '3'; // Начальное значение (0.003 = 3% от max 0.1)
	speedSlider.className = 'control-slider speed-slider';
	
	// Создаем отображение значения скорости
	const speedValueDisplay = document.createElement('div');
	speedValueDisplay.className = 'control-value speed-value';
	speedValueDisplay.textContent = speedSlider.value + '%';
	
	// === VOLUME CONTROL ===
	// Создаем подпись для громкости
	const volumeLabel = document.createElement('div');
	volumeLabel.className = 'control-label volume-label';
	volumeLabel.textContent = 'volume';
	
	// Создаем слайдер громкости
	const volumeSlider = document.createElement('input');
	volumeSlider.type = 'range';
	volumeSlider.min = '0';
	volumeSlider.max = '100';
	volumeSlider.value = '80'; // Начальное значение громкости 80%
	volumeSlider.className = 'control-slider volume-slider';
	
	// Создаем отображение значения громкости
	const volumeValueDisplay = document.createElement('div');
	volumeValueDisplay.className = 'control-value volume-value';
	volumeValueDisplay.textContent = volumeSlider.value + '%';
	
	// Добавляем элементы в контейнер
	// Rotation Speed
	controlContainer.appendChild(speedLabel);
	controlContainer.appendChild(speedSlider);
	controlContainer.appendChild(speedValueDisplay);
	
	// Volume
	controlContainer.appendChild(volumeLabel);
	controlContainer.appendChild(volumeSlider);
	controlContainer.appendChild(volumeValueDisplay);
	
	// Добавляем стили
	const style = document.createElement('style');
	style.textContent = `
		.controls-container {
			position: fixed;
			top: 40px;
			left: 40px;
			background-color: rgba(26, 26, 26, 0.7);
			border: 2px solid;
			border-image: linear-gradient(to bottom, rgba(0, 210, 255, 0.6), rgba(177, 78, 255, 0.6)) 1;
			border-radius: 10px;
			padding: 15px;
			z-index: 100;
			color: white;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			display: flex;
			flex-direction: column;
			gap: 8px;
			backdrop-filter: blur(5px);
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			transition: opacity 0.3s ease;
			opacity: 0.7;
			width: 200px;
		}
		
		.controls-container:hover {
			opacity: 1;
		}
		
		.control-label {
			font-size: 14px;
			color: rgba(255, 255, 255, 0.9);
			margin-bottom: 5px;
			font-weight: 300;
		}
		
		.speed-label {
			margin-top: 0;
		}
		
		.volume-label {
			margin-top: 10px;
		}
		
		.control-value {
			font-size: 12px;
			text-align: right;
			font-weight: 500;
		}
		
		.speed-value {
			color: rgba(0, 210, 255, 0.9);
		}
		
		.volume-value {
			color: rgba(177, 78, 255, 0.9);
		}
		
		.control-slider {
			-webkit-appearance: none;
			appearance: none;
			width: 100%;
			height: 4px;
			background: rgba(255, 255, 255, 0.2);
			outline: none;
			border-radius: 2px;
			margin: 10px 0;
		}
		
		.speed-slider::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: rgba(0, 210, 255, 0.8);
			cursor: pointer;
			box-shadow: 0 0 5px rgba(0, 210, 255, 0.5);
			transition: all 0.2s ease;
		}
		
		.speed-slider::-moz-range-thumb {
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: rgba(0, 210, 255, 0.8);
			cursor: pointer;
			box-shadow: 0 0 5px rgba(0, 210, 255, 0.5);
			border: none;
			transition: all 0.2s ease;
		}
		
		.volume-slider::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: rgba(177, 78, 255, 0.8);
			cursor: pointer;
			box-shadow: 0 0 5px rgba(177, 78, 255, 0.5);
			transition: all 0.2s ease;
		}
		
		.volume-slider::-moz-range-thumb {
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: rgba(177, 78, 255, 0.8);
			cursor: pointer;
			box-shadow: 0 0 5px rgba(177, 78, 255, 0.5);
			border: none;
			transition: all 0.2s ease;
		}
		
		.speed-slider::-webkit-slider-thumb:hover,
		.speed-slider::-moz-range-thumb:hover {
			background: rgba(0, 210, 255, 1);
			box-shadow: 0 0 10px rgba(0, 210, 255, 0.8);
			transform: scale(1.1);
		}
		
		.volume-slider::-webkit-slider-thumb:hover,
		.volume-slider::-moz-range-thumb:hover {
			background: rgba(177, 78, 255, 1);
			box-shadow: 0 0 10px rgba(177, 78, 255, 0.8);
			transform: scale(1.1);
		}
		
		.control-slider::-webkit-slider-runnable-track,
		.control-slider::-moz-range-track {
			border-radius: 2px;
		}
		
		@media (max-width: 768px) {
			.controls-container {
				top: 20px;
				left: 20px;
				padding: 10px;
				width: 160px;
			}
		}
	`;
	
	// Устанавливаем начальные значения
	audioElement.volume = parseFloat(volumeSlider.value) / 100;
	rotationSpeed = parseFloat(speedSlider.value) / 1000;
	
	// Добавляем обработчик событий для слайдера скорости
	speedSlider.addEventListener('input', function() {
		rotationSpeed = parseFloat(this.value) / 1000;
		speedValueDisplay.textContent = this.value + '%';
	});
	
	// Добавляем обработчик событий для слайдера громкости
	volumeSlider.addEventListener('input', function() {
		const volume = parseFloat(this.value) / 100;
		
		// Обновляем только gainNode, НЕ обновляем audioElement.volume
		if (gainNode && audioContext) {
			gainNode.gain.value = volume;
		}
		
		volumeValueDisplay.textContent = this.value + '%';
	});
	
	// Добавляем стили и контейнер в документ
	document.head.appendChild(style);
	document.body.appendChild(controlContainer);
	
	// Возвращаем элементы для доступа из других функций
	return {
		rotationSpeedSlider: speedSlider,
		rotationSpeedValue: speedValueDisplay,
		volumeSlider: volumeSlider,
		volumeValue: volumeValueDisplay
	};
}

// Создаем и добавляем объединенный контрол
createCombinedControls(audio);

// Функция для создания контрола скорости вращения
function createRotationSpeedControl() {
	// Создаем контейнер для контрола
	const controlContainer = document.createElement('div');
	controlContainer.className = 'rotation-speed-control';
	
	// Создаем подпись
	const label = document.createElement('div');
	label.className = 'rotation-speed-label';
	label.textContent = 'Rotation Speed';
	
	// Создаем слайдер
	const slider = document.createElement('input');
	slider.type = 'range';
	slider.min = '0';
	slider.max = '100';
	slider.value = '3'; // Начальное значение (0.003 = 3% от max 0.1)
	slider.className = 'rotation-speed-slider';
	
	// Создаем отображение текущего значения
	const valueDisplay = document.createElement('div');
	valueDisplay.className = 'rotation-speed-value';
	valueDisplay.textContent = slider.value + '%';
	
	// Добавляем элементы в контейнер
	controlContainer.appendChild(label);
	controlContainer.appendChild(slider);
	controlContainer.appendChild(valueDisplay);
	
	// Добавляем стили
	const style = document.createElement('style');
	style.textContent = `
		.rotation-speed-control {
			position: fixed;
			top: 40px;
			left: 40px;
			background-color: rgba(26, 26, 26, 0.7);
			border: 1px solid rgba(0, 210, 255, 0.4);
			border-radius: 10px;
			padding: 15px;
			z-index: 100;
			color: white;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			display: flex;
			flex-direction: column;
			gap: 8px;
			backdrop-filter: blur(5px);
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
			transition: opacity 0.3s ease;
			opacity: 0.7;
			width: 200px;
		}
		
		.rotation-speed-control:hover {
			opacity: 1;
		}
		
		.rotation-speed-label {
			font-size: 14px;
			color: rgba(255, 255, 255, 0.9);
			margin-bottom: 5px;
			font-weight: 300;
		}
		
		.rotation-speed-value {
			font-size: 12px;
			color: rgba(0, 210, 255, 0.9);
			text-align: right;
			font-weight: 500;
		}
		
		.rotation-speed-slider {
			-webkit-appearance: none;
			appearance: none;
			width: 100%;
			height: 4px;
			background: rgba(255, 255, 255, 0.2);
			outline: none;
			border-radius: 2px;
			margin: 10px 0;
		}
		
		.rotation-speed-slider::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: rgba(0, 210, 255, 0.8);
			cursor: pointer;
			box-shadow: 0 0 5px rgba(0, 210, 255, 0.5);
			transition: all 0.2s ease;
		}
		
		.rotation-speed-slider::-moz-range-thumb {
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: rgba(0, 210, 255, 0.8);
			cursor: pointer;
			box-shadow: 0 0 5px rgba(0, 210, 255, 0.5);
			border: none;
			transition: all 0.2s ease;
		}
		
		.rotation-speed-slider::-webkit-slider-thumb:hover,
		.rotation-speed-slider::-moz-range-thumb:hover {
			background: rgba(0, 210, 255, 1);
			box-shadow: 0 0 10px rgba(0, 210, 255, 0.8);
			transform: scale(1.1);
		}
		
		.rotation-speed-slider::-webkit-slider-runnable-track,
		.rotation-speed-slider::-moz-range-track {
			border-radius: 2px;
		}
		
		@media (max-width: 768px) {
			.rotation-speed-control {
				top: 20px;
				left: 20px;
				padding: 10px;
				width: 160px;
			}
		}
	`;
	
	// Добавляем обработчик событий для слайдера
	slider.addEventListener('input', function() {
		// Обновляем значение скорости вращения (от 0 до 0.1)
		rotationSpeed = parseFloat(this.value) / 1000;
		valueDisplay.textContent = this.value + '%';
	});
	
	// Добавляем стили и контейнер в документ
	document.head.appendChild(style);
	document.body.appendChild(controlContainer);
}

// Цвета для визуализации
const colors = [
	{ r: 0, g: 210, b: 255 },   // Cyan
	{ r: 30, g: 144, b: 255 },  // Dodger Blue
	{ r: 65, g: 105, b: 225 },  // Royal Blue
	{ r: 138, g: 43, b: 226 }   // Blue Violet
];

// Инициализация Web Audio API
function initAudio() {
    // Создаем аудио контекст
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Создаем источник из элемента audio
    audioSource = audioContext.createMediaElementSource(audio);
    
    // Создаем разделитель каналов для визуализации (без регулировки громкости)
    splitter = audioContext.createChannelSplitter(2);
    
    // Создаем анализаторы для левого и правого каналов
    analyserLeft = audioContext.createAnalyser();
    analyserRight = audioContext.createAnalyser();
    
    // Настраиваем анализаторы
    analyserLeft.fftSize = 1024;
    analyserRight.fftSize = 1024;
    analyserLeft.smoothingTimeConstant = 0.5;
    analyserRight.smoothingTimeConstant = 0.5;
    
    // Устанавливаем максимальную чувствительность для анализаторов
    analyserLeft.minDecibels = -90;
    analyserLeft.maxDecibels = -10;
    analyserRight.minDecibels = -90;
    analyserRight.maxDecibels = -10;
    
    bufferLength = analyserLeft.fftSize;
    
    // Создаем массивы для хранения временной области данных
    dataArrayLeft = new Float32Array(bufferLength);
    dataArrayRight = new Float32Array(bufferLength);
    
    // Создаем дополнительный усилитель для визуализации на полной громкости
    const visualizerGain = audioContext.createGain();
    visualizerGain.gain.value = 1.0; // Всегда на максимуме для визуализации
    
    // Создаем ноду для управления громкостью звука
    gainNode = audioContext.createGain();
    gainNode.gain.value = audio.volume;
    
    // Подключаем аудиоисточник к двум разным путям:
    
    // 1. Путь для визуализации (всегда макс. громкость)
    audioSource.connect(visualizerGain);
    visualizerGain.connect(splitter);
    splitter.connect(analyserLeft, 0);
    splitter.connect(analyserRight, 1);
    
    // 2. Путь для воспроизведения звука (регулируемая громкость)
    audioSource.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Отключаем встроенную громкость аудиоэлемента, 
    // будем полностью контролировать через gainNode
    audio.volume = 1.0;
}

// Функция для применения вращения к точке
function rotatePoint(x, y, centerX, centerY, angle) {
	// Перемещаем точку относительно центра
	const translatedX = x - centerX;
	const translatedY = y - centerY;
	
	// Применяем матрицу вращения
	const rotatedX = translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
	const rotatedY = translatedX * Math.sin(angle) + translatedY * Math.cos(angle);
	
	// Возвращаем точку на место
	return {
		x: rotatedX + centerX,
		y: rotatedY + centerY
	};
}

// Функция для рисования VectorScope
function drawVectorScope() {
    // Получаем данные временной области с анализаторов
    analyserLeft.getFloatTimeDomainData(dataArrayLeft);
    analyserRight.getFloatTimeDomainData(dataArrayRight);

    // Определяем максимальную амплитуду для нормализации
    let maxAmplitude = 0.01; // Минимальное значение, чтобы избежать деления на ноль
    
    // Находим максимальное значение в данных
    for (let i = 0; i < bufferLength; i++) {
        const leftAbs = Math.abs(dataArrayLeft[i]);
        const rightAbs = Math.abs(dataArrayRight[i]);
        maxAmplitude = Math.max(maxAmplitude, leftAbs, rightAbs);
    }
    
    // Коэффициент нормализации (усиление для низких уровней сигнала)
    const normalizationFactor = Math.min(1.0 / maxAmplitude, 4.0); // Ограничиваем усиление
    
    // Полупрозрачная очистка канваса для эффекта затухания
    ctx.fillStyle = 'rgba(26, 26, 26, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Определяем центр и размер визуализации
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;
    
    // Увеличиваем угол вращения
    rotationAngle += rotationSpeed;
    if (rotationAngle > Math.PI * 2) {
        rotationAngle -= Math.PI * 2; // Сброс угла для предотвращения переполнения
    }
    
    // Рисуем фоновые элементы VectorScope
    drawVectorScopeBackground(centerX, centerY, radius);
    
    // Создаем массив точек для текущего кадра
    const points = [];
    const sampleStep = Math.floor(bufferLength / 256); // Прореживаем образцы для производительности
    
    for (let i = 0; i < bufferLength; i += sampleStep) {
        // Получаем значения левого и правого каналов и нормализуем их
        const leftValue = dataArrayLeft[i] * normalizationFactor;
        const rightValue = dataArrayRight[i] * normalizationFactor;
        
        // Преобразуем значения в координаты
        // В VectorScope левый канал обычно на оси X, правый - на оси Y
        const rawX = centerX + radius * leftValue;
        const rawY = centerY + radius * rightValue;
        
        // Применяем вращение
        const rotated = rotatePoint(rawX, rawY, centerX, centerY, rotationAngle);
        
        points.push(rotated);
    }
    
    // Добавляем новые точки в историю
    trailHistory.unshift(points);
    
    // Ограничиваем длину истории
    if (trailHistory.length > trailLength) {
        trailHistory.pop();
    }
    
    // Рисуем точки с эффектом затухания
    for (let t = 0; t < trailHistory.length; t++) {
        const framePoints = trailHistory[t];
        const opacity = 1 - (t / trailLength);
        
        for (let i = 0; i < framePoints.length; i++) {
            const point = framePoints[i];
            
            // Выбираем цвет из палитры в зависимости от положения
            const colorIndex = Math.min(
                Math.floor(Math.sqrt(
                    Math.pow((point.x - centerX) / radius, 2) + 
                    Math.pow((point.y - centerY) / radius, 2)
                ) * colors.length),
                colors.length - 1
            );
            
            const color = colors[colorIndex];
            
            // Рисуем точку
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.fill();
        }
    }
    
    // Рисуем соединительные линии для текущего кадра
    if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Продолжаем анимацию если воспроизведение активно
    if (isPlaying) {
        animationId = requestAnimationFrame(drawVectorScope);
    }
}

// Рисуем фоновые элементы VectorScope
function drawVectorScopeBackground(centerX, centerY, radius) {
	// Сохраняем текущее состояние контекста
	ctx.save();
	
	// Переносим начало координат в центр визуализации
	ctx.translate(centerX, centerY);
	// Вращаем контекст (только для сетки, не для данных)
	ctx.rotate(rotationAngle * 0.2); // Более медленное вращение сетки для эффекта глубины
	
	// Рисуем круговую шкалу
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, Math.PI * 2);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	// Рисуем внешний круг (100% громкости)
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, Math.PI * 2);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	// Рисуем средний круг (75% громкости)
	ctx.beginPath();
	ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	// Рисуем внутренний круг (50% громкости)
	ctx.beginPath();
	ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	// Рисуем центральный круг (25% громкости)
	ctx.beginPath();
	ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	// Рисуем вертикальную линию (центральная ось Y)
	ctx.beginPath();
	ctx.moveTo(0, -radius);
	ctx.lineTo(0, radius);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	// Рисуем горизонтальную линию (центральная ось X)
	ctx.beginPath();
	ctx.moveTo(-radius, 0);
	ctx.lineTo(radius, 0);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	// Рисуем диагональные линии для моно сигнала (L=R и L=-R)
	ctx.beginPath();
	ctx.moveTo(-radius * 0.7071, -radius * 0.7071);
	ctx.lineTo(radius * 0.7071, radius * 0.7071);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(-radius * 0.7071, radius * 0.7071);
	ctx.lineTo(radius * 0.7071, -radius * 0.7071);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
	ctx.lineWidth = 1;
	ctx.stroke();
	
	// Восстанавливаем состояние контекста
	ctx.restore();
}

// Функция для режима ожидания
function drawIdleVectorScope() {
	// Полупрозрачная очистка канваса
	ctx.fillStyle = 'rgba(26, 26, 26, 0.15)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	// Определяем центр и размер визуализации
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	const radius = Math.min(canvas.width, canvas.height) * 0.3;
	
	// Увеличиваем угол вращения (даже в режиме ожидания)
	rotationAngle += rotationSpeed * 0.8; // Немного медленнее в режиме ожидания
	if (rotationAngle > Math.PI * 2) {
		rotationAngle -= Math.PI * 2;
	}
	
	// Рисуем фоновые элементы VectorScope
	drawVectorScopeBackground(centerX, centerY, radius);
	
	// Рисуем имитацию точек в режиме ожидания
	const time = Date.now() * 0.001;
	const points = [];
	
	// Создаем фигуру Лиссажу для эффекта ожидания
	for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
		const frequency1 = 2;
		const frequency2 = 3;
		const phase = time * 0.5;
		
		const rawX = centerX + radius * 0.4 * Math.sin(angle * frequency1 + phase);
		const rawY = centerY + radius * 0.4 * Math.sin(angle * frequency2);
		
		// Применяем вращение
		const rotated = rotatePoint(rawX, rawY, centerX, centerY, rotationAngle);
		
		points.push(rotated);
	}
	
	// Рисуем соединительные линии
	if (points.length > 0) {
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		
		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		
		// Замыкаем фигуру
		ctx.lineTo(points[0].x, points[0].y);
		
		ctx.strokeStyle = 'rgba(0, 180, 255, 0.3)';
		ctx.lineWidth = 2;
		ctx.stroke();
	}
	
	// Рисуем точки на фигуре
	for (let i = 0; i < points.length; i++) {
		ctx.beginPath();
		ctx.arc(points[i].x, points[i].y, 1, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(0, 210, 255, ${0.5 + 0.5 * Math.sin(i * 0.2 + time * 3)})`;
		ctx.fill();
	}
	
	// Продолжаем анимацию состояния ожидания
	if (!isPlaying) {
		animationId = requestAnimationFrame(drawIdleVectorScope);
	}
}

// Запускаем начальную визуализацию режима ожидания
drawIdleVectorScope();

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
		
		// Возвращаем скорость вращения к значению по умолчанию
		rotationSpeed = defaultRotationSpeed;
		
		// Обновляем значение слайдера
		const speedSlider = document.querySelector('.speed-slider');
		if (speedSlider) {
			speedSlider.value = '3';
			const speedValueDisplay = document.querySelector('.speed-value');
			if (speedValueDisplay) {
				speedValueDisplay.textContent = '3%';
			}
		}
		
		// Очищаем историю точек
		trailHistory.length = 0;
		
		// Запускаем визуализацию режима ожидания
		drawIdleVectorScope();
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
			drawVectorScope();
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
	
	// Возвращаем скорость вращения к значению по умолчанию
	rotationSpeed = defaultRotationSpeed;
	
	// Обновляем значение слайдера
	const speedSlider = document.querySelector('.speed-slider');
	if (speedSlider) {
		speedSlider.value = '3';
		const speedValueDisplay = document.querySelector('.speed-value');
		if (speedValueDisplay) {
			speedValueDisplay.textContent = '3%';
		}
	}
	
	// Очищаем историю точек
	trailHistory.length = 0;
	
	// Запускаем визуализацию режима ожидания
	drawIdleVectorScope();
});
});