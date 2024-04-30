async function main() {
    const video = document.getElementById('video');
    const model = await handpose.load();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    video.addEventListener('loadeddata', async () => {
        const result = document.getElementById('result');

        function repeatPrediction() {
            model.estimateHands(video).then(predictions => {
                if (predictions.length > 0) {
                    const landmarks = predictions[0].landmarks;
                    const userGesture = detectGesture(landmarks);
                    const computerGesture = getComputerGesture();
                    const gameResult = judgeJanken(userGesture, computerGesture);
                    result.innerText = `あなたの手の形: ${userGesture}\nコンピュータの手の形: ${computerGesture}\n勝敗: ${gameResult}`;
                    
                    // 認識したら繰り返しを停止
                    if (userGesture !== '認識中') {
                        return;
                    }
                } else {
                    result.innerText = '認識中';
                }
                requestAnimationFrame(repeatPrediction); // 繰り返しを継続
            });
        }

        requestAnimationFrame(repeatPrediction);
    });
}

function detectGesture(landmarks) {
    // 各指の先端と第二関節のY座標を比較
    const thumbIsOpen = landmarks[4][0] > landmarks[3][0];
    const indexIsOpen = landmarks[8][1] < landmarks[6][1];
    const middleIsOpen = landmarks[12][1] < landmarks[10][1];
    const ringIsOpen = landmarks[16][1] < landmarks[14][1];
    const pinkyIsOpen = landmarks[20][1] < landmarks[18][1];

    const fingersOpen = [indexIsOpen, middleIsOpen, ringIsOpen, pinkyIsOpen].filter(Boolean).length;

    if (!thumbIsOpen && fingersOpen === 0) {
        return 'グー';
    } else if (thumbIsOpen && fingersOpen === 4) {
        return 'パー';
    } else if (thumbIsOpen && fingersOpen === 2 && indexIsOpen && middleIsOpen) {
        return 'チョキ';
    } else {
        return '認識中';
    }
}

// function getComputerGesture() {
//     const gestures = ['グー', 'チョキ', 'パー'];
//     const randomIndex = Math.floor(Math.random() * gestures.length);
//     return gestures[randomIndex];
// }

function getComputerGesture() {
    const gestures = ['グー', 'チョキ', 'パー'];
    const randomIndex = Math.floor(Math.random() * gestures.length);
    
    // 音楽を再生
    const sound = document.getElementById('jankenSound');
    sound.play();

    return gestures[randomIndex];
}


function judgeJanken(userGesture, computerGesture) {
    if (userGesture === computerGesture) {
        return '引き分け';
    }
    if ((userGesture === 'グー' && computerGesture === 'チョキ') ||
        (userGesture === 'チョキ' && computerGesture === 'パー') ||
        (userGesture === 'パー' && computerGesture === 'グー')) {
        return '勝ち';
    }
    return '負け';
}

main();
