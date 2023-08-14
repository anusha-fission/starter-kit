import React, {useState} from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroConstants,
} from '@viro-community/react-viro';
import styles from './AppStyles';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

var path = RNFS.DocumentDirectoryPath;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
      cameraTransformInfo: [],
      fileName: '',
    };
    this.ARSceneNav = null;
  }

  onShareVideo = async videoUrl => {
    try {
      const result = await Share.open({
        url: `file://${videoUrl}`,
        type: 'video/mp4',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  onShare = async videoUrl => {
    try {
      const result = await Share.open({
        urls: [
          `file://${path}/${this.state.fileName}.txt`,
          `file://${videoUrl}`,
        ],
      });
      if (result.action === Share.sharedAction) {
        this.onShareVideo(videoUrl);
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  onCameraTransformUpdate = pos => {
    if (this.state.isRecording) {
      this.setState(prevState => ({
        cameraTransformInfo: [...prevState.cameraTransformInfo, pos.position],
      }));
    }
  };

  InitialARScene = () => {
    return (
      <ViroARScene
        onCameraTransformUpdate={pos => {
          this.onCameraTransformUpdate(pos);
        }}>
        {/* <ViroText
          text={text}
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, -1]}
          style={styles.helloWorldTextStyle}
        /> */}
      </ViroARScene>
    );
  };

  recordError = e => {
    Alert.alert('Try Again', 'Failed to start recording, try again!');
    console.error('recordError', e);
    // setIsRecording(!isRecording);
    this.setState(prevState => ({
      isRecording: !prevState.isRecording,
    }));
  };

  writeCameraTranformFile = videoUrl => {
    const {cameraTransformInfo, fileName} = this.state;
    console.log('cameraTransformInfo?.length,', cameraTransformInfo?.length);
    RNFS.writeFile(
      `${path}/${fileName}.txt`,
      JSON.stringify(cameraTransformInfo),
      'utf8',
    )
      .then(success => {
        this.onShare(videoUrl);
      })
      .catch(err => {
        console.error(err.message);
      });
  };

  handleRecord = async () => {
    const {isRecording} = this.state;
    const fileName = `${new Date().getTime()}`;
    if (this.ARSceneNav?.sceneNavigator?.startVideoRecording) {
      if (!isRecording) {
        this.setState(
          {cameraTransformInfo: [], fileName, isRecording: true},
          () => {
            this.ARSceneNav.sceneNavigator.startVideoRecording(
              fileName,
              true,
              this.recordError,
            );
          },
        );
        console.log('recording startd!');
      } else {
        const stop = await this.ARSceneNav.sceneNavigator.stopVideoRecording();
        this.writeCameraTranformFile(stop.url);
        if (stop.success) {
          Alert.alert('Video Saved', `Video is save to ${stop.url}`);
        } else {
          Alert.alert(
            'Failed to save video',
            `Failed with errorCode: ${stop.errorCode}`,
          );
        }
        this.setState({isRecording: false});
        console.log('recording end', stop, path, stop.url);
      }
    }
  };
  render() {
    const {isRecording} = this.state;
    return (
      <View style={{flex: 1}}>
        <ViroARSceneNavigator
          ref={nav => (this.ARSceneNav = nav)}
          initialScene={{scene: this.InitialARScene}}
          autofocus={true}
        />
        <TouchableOpacity
          style={styles.recordButton}
          onPress={this.handleRecord}>
          <Text style={styles.recordText}>
            {isRecording ? 'Stop' : 'Record'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default App;
