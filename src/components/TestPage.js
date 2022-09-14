import React, { Component } from "react";
import axios from 'axios';

class TestPage extends Component {
    state = {
        image_file: null,
        uploadDone: false
    }

    dataURItoBlob = (dataURI) => {
        var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }
    
    capture = () => {
        var canvas = document.getElementById("canvas");
        var video = document.querySelector("video");
        video.crossorigin = 'anonymous';
        console.log('video: ', video)
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas
            .getContext("2d")
            .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        // save the captured image
        // canvas to blob
        // var canvas = document.getElementById("canvas");
        // // var dataURL = canvas.toDataURL();
        // let image_file = null;
        // await canvas.toBlob((blob) => {
        //     image_file = new File([blob], 'captured.png', {type: 'image/png'});
        //     console.log('image file in callback', image_file);
        // }, 'image/png');
        // console.log('image file: ', image_file);
        this.setState({
            uploadDone: false
        })
    }

    upload = () => {
        console.log('up')
        // canvas to blob
        var canvas = document.getElementById("canvas");
        // var dataURL = canvas.toDataURL();
        let image_file = null;
        canvas.toBlob((blob) => {
            image_file = new File([blob], 'captured.png', {type: 'image/png'});
            console.log('image file in callback', image_file);
        }, 'image/png');
        // upload blob to server
        setTimeout(async () => {
            console.log('file to upload', image_file);
            var fd = new FormData();
            fd.append("Image", image_file);
            try {              
                var res = await axios.post("http://localhost:5258/api/Products/1/images", fd);
                this.setState({
                    uploadDone: true
                });
            }
            catch(error) {
                console.log('error: ', error)
            }
        }, 100)
    }

    render() {
        return (
            <div>
                <h1>Nháp tất cả mọi thứ</h1>
                <br></br>
                <br></br>
                <div>
                    <video crossOrigin="anonymous" id="video" src="https://res.cloudinary.com/quocdatcloudinary/video/upload/v1663156548/QuocDat/mov_bbb_su10nm.mp4" type="video/mp4" controls></video>
                    <br></br>
                    <button onClick={this.capture}>Capture</button>
                    <br></br>
                    <canvas id="canvas" style={{overflow:'auto'}}></canvas>
                    <br></br>
                    <button onClick={this.upload}>Upload</button>
                </div>
                {
                    this.state.uploadDone && <h3>Upload done!</h3>
                }
            </div>
        );
    }
}
export default TestPage;