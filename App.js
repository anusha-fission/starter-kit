import React, {useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  PixelRatio,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroText,
  ViroMaterials,
  ViroBox,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroARPlane,
  ViroARPlaneSelector,
  ViroQuad,
  ViroNode,
  ViroAnimations,
  ViroConstants,
} from '@viro-community/react-viro';
import styles from './AppStyles';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const App = () => {
  var path = RNFS.DocumentDirectoryPath + '/viroRecord.txt';
  const [text, setText] = useState('Initializing AR...');
  const [isRecording, setIsRecording] = useState(false);
  const [cameraTransformInfo, setCameraTransformInfo] = useState([]);
  let ARSceneNav;

  const onShare = async videoUrl => {
    try {
      const result = await Share.open({
        urls: [`file://${path}`, `file:/${videoUrl}`],
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

  function onInitialized(state, reason) {
    console.log('guncelleme', state, reason, ARSceneNav?.bloomEnabled);
    if (state === ViroConstants.TRACKING_NORMAL) {
      setText('Hello World!');
    } else if (state === ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }

  function onCameraTransformUpdate(pos) {
    cameraTransformInfo.push(pos);
    setCameraTransformInfo(cameraTransformInfo);
  }

  const InitialARScene = () => {
    return (
      <ViroARScene
        onTrackingUpdated={onInitialized}
        onCameraTransformUpdate={onCameraTransformUpdate}>
        <ViroText
          text={text}
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, -1]}
          style={styles.helloWorldTextStyle}
        />
      </ViroARScene>
    );
  };

  const recordError = e => {
    console.error('recordError', e);
  };

  const writeCameraTranformFile = () => {
    console.log(JSON.stringify(cameraTransformInfo));
    RNFS.writeFile(path, JSON.stringify(cameraTransformInfo), 'utf8')
      .then(success => {
        console.log('FILE WRITTEN!');
        onShare();
      })
      .catch(err => {
        console.log(err.message);
      });
  };

  const handleRecord = async () => {
    if (ARSceneNav?.sceneNavigator) {
      if (!isRecording) {
        setCameraTransformInfo([]);
        ARSceneNav.sceneNavigator.startVideoRecording(
          'viroRecord',
          true,
          recordError,
        );
      } else {
        const stope = await ARSceneNav.sceneNavigator.stopVideoRecording();
        writeCameraTranformFile(stope.url);
        console.log('recording end', stope, path, stope.url);
      }
    }
    setIsRecording(!isRecording);
  };

  return (
    <View style={{flex: 1}}>
      <ViroARSceneNavigator
        ref={nav => (ARSceneNav = nav)}
        initialScene={{scene: InitialARScene}}
        autofocus={true}
      />
      <TouchableHighlight style={styles.recordButton} onPress={handleRecord}>
        <Text style={styles.recordText}>{isRecording ? 'Stop' : 'Record'}</Text>
      </TouchableHighlight>
    </View>
  );
};

export default App;
