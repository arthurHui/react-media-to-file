import React, { useState, useEffect, useRef } from 'react'
import SiriWave from "siriwave";

type porps = {
    onFinished: Function,
    mimeType?: string,
}

const Recorder = ({
    onFinished,
    mimeType = 'audio/webm;codecs=opus'
}: porps) => {

    const siriWave = useRef<SiriWave | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const [permission, setPermission] = useState(false);
    const [audioChunks, setAudioChunks] = useState<Array<Blob>>([]);
    const [isRecording, setIsRecording] = useState(false);

    const startRecording = async () => {
        //create new Media recorder instance using the stream
        if (mediaStream.current) {
            const media = new MediaRecorder(mediaStream.current, { mimeType: mimeType });
            //set the MediaRecorder instance to the mediaRecorder ref
            mediaRecorder.current = media;
            //invokes the start method to start the recording process
            mediaRecorder.current.start();
            mediaRecorder.current.ondataavailable = (event) => {
                if (typeof event.data === 'undefined') return;
                if (event.data.size === 0) return;
                setAudioChunks(prev => [...prev, event.data]);
            };
        }
    };

    const stopRecording = () => {
        //stops the recording instance
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            mediaRecorder.current.onstop = () => {
                console.log('!!!onstop');
            };
        }
    };

    const recording = (isStop: boolean) => {
        if (!!permission) {
            if (!isStop) {
                setIsRecording(true);
                startRecording();

                setTimeout(() => {
                    setIsRecording(false);
                    stopRecording();
                }, 5000);
            } else {
                // clearTimeout(timeout);
                // setIsRecording(false);
                // stopRecording();
            }
        } else {

        }
    };

    useEffect(() => {
        if (audioChunks.length) {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const file = new File([audioBlob], 'audio.webm', {
                type: 'audio/webm;codecs=opus',
            });
            onFinished(file)
            setAudioChunks([]);
        }
    }, [audioChunks]);

    useEffect(() => {
        const navigator = (window.navigator as any)
        navigator.getWebcam = (navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            })
                .then((stream: MediaStream) => {
                    setPermission(true);
                    mediaStream.current = stream;
                })
                .catch(() => {
                    setPermission(false);
                });
        } else {
            navigator.getWebcam({
                audio: true,
                video: false,
            })
                .then((stream: MediaStream) => {
                    setPermission(true);
                    mediaStream.current = stream;
                })
                .catch(() => {
                    setPermission(false);
                });
        }
        const newSiriWave = new SiriWave({
            container: document.getElementById("siriwave-container")!,
            style: 'ios9',
            cover: true,
            amplitude: 0.1
        });
        siriWave.current = newSiriWave
    }, [])

    return (
        <div className='recorder-container'>
            <div id="siriwave-container" onClick={() => { recording(isRecording) }}></div>
        </div>
    )
}

export default Recorder