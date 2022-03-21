import React, {
  useState,
} from 'react';
import {
  StyleSheet,
  Dimensions,
  PixelRatio,
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
  ViroConstants
} from '@viro-community/react-viro';


const MeasureSceneAR = () => {
  const [initialized, setInitialized] = useState(false)
  const [text, setText] = useState('Initializing AR...')
  const [firstNodePlaced, setFirstNodePlaced] = useState(false)
  const [distance, setDistance] = useState(null)

  const arSceneRef = React.useRef(null)
  const nodeRef1 = React.useRef(null)
  const nodeRef2 = React.useRef(null)

  const _onTrackingUpdated = (state, reason) => {
    // if the state changes to "TRACKING_NORMAL" for the first time, then
    // that means the AR session has initialized!
    console.log(state);
    if (!initialized && state === ViroConstants.TRACKING_NORMAL) {
      setInitialized(true);
      setText('Hello World!');
      console.log('tracked');
    }
  }

  const handleSceneClick = source => {
    console.log('handleSceneClick',((Dimensions.get('window').width * PixelRatio.get()) / 2, (Dimensions.get('window').height * PixelRatio.get()) / 2),arSceneRef);
    arSceneRef.current.performARHitTestWithPoint((Dimensions.get('window').width * PixelRatio.get()) / 2, (Dimensions.get('window').height * PixelRatio.get()) / 2)
      .then((results) => {
        console.log('handleSceneClick',results);
        for (var i = 0; i < results.length; i++) {
          let result = results[i];
          if (result.type === "ExistingPlaneUsingExtent") {
            // We hit a plane, do something!
            if (firstNodePlaced) {
              console.log('move two')

              nodeRef2.current.setNativeProps({
                position: result.transform.position,
                visible: true,
              })

              nodeRef1.current.getTransformAsync().then(transform => {
                console.log(transform.position);

                getDistance(transform.position, result.transform.position)
              })

            } else {
              console.log('move one')

              nodeRef2.current.setNativeProps({
                visible: false
              });

              nodeRef1.current.setNativeProps({
                position: result.transform.position,
                visible: true
              })

              setFirstNodePlaced(true)
            }
          }
        }
      }).catch(err=>{
        console.error('handleSceneClick',err);
      })
  }

  const getDistance = (positionOne, positionTwo) => {
    // Compute the difference vector between the two hit locations.
    const dx = positionOne[0] - positionTwo[0];
    const dy = positionOne[1] - positionTwo[1];
    const dz = positionOne[2] - positionTwo[2];

    // // Compute the straight-line distance.
    const distanceMeters = Math.sqrt(dx * dx + dy * dy + dz * dz);

    console.log(distanceMeters * 100)

    setDistance(distanceMeters * 100)
  }

  const handleDrag = (dragToPos, source) => {
    nodeRef1.current.getTransformAsync().then(transform => {
      console.log(transform.position);

      getDistance(transform.position, dragToPos)
    })
  }

  return (
    <ViroARScene
      ref = {arSceneRef}
      onTrackingUpdated = {_onTrackingUpdated}
      onClick = {handleSceneClick}
    >
      <ViroNode
        ref = {nodeRef1}
        position = {[0, 0, 0]}
        visible = {false}
        onClick = {() => {}}
        onDrag = {() => {}}
        dragType = "FixedToWorld"
      >
      <ViroSpotLight
        innerAngle = {5}
        outerAngle = {45}
        direction = {[0, -1, -0.2]}
        position = {[0, 3, 0]}
        color = "#ffffff"
        castsShadow = {true}
        influenceBitMask = {2}
        shadowMapSize = {2048}
        shadowNearZ = {2}
        shadowFarZ = {5}
        shadowOpacity = {0.7}
      />
      <Viro3DObject
       source={require('./assets/emoji_smile.vrx')}
        position = {[0, 0, 0]}
        scale = {[0.25, 0.25, 0.25]}
        type = "VRX"
        lightReceivingBitMask = {3}
        shadowCastingBitMask = {2}
        transformBehaviors = {['billboardY']}
        resources={[require('./assets/emoji_smile_diffuse.png'),
                       require('./assets/emoji_smile_specular.png'),
                       require('./assets/emoji_smile_normal.png')]}
        />
      </ViroNode >

      <ViroNode
        ref = {nodeRef2}
        position = {[0, 0, 0]}
        visible = {false}
        onClick = {() => {}}
        onDrag = {handleDrag}
        dragType = "FixedToWorld"
      >
        <ViroSpotLight
          innerAngle = {5}
          outerAngle = {45}
          direction = {[0, -1, -0.2]}
          position = {[0, 3, 0]}
          color = "#ffffff"
          castsShadow = {true}
          influenceBitMask = {2}
          shadowMapSize = {2048}
          shadowNearZ = {2}
          shadowFarZ = {5}
          shadowOpacity = {0.7}
        />
        <Viro3DObject
         source={require('./assets/emoji_smile.vrx')}
          position = {[0, 0, 0]}
          scale = {[0.25, 0.25, 0.25]}
          type = "VRX"
          lightReceivingBitMask = {3}
          shadowCastingBitMask = {2}
          transformBehaviors = {['billboardY']}
          resources={[require('./assets/emoji_smile_diffuse.png'),
                     require('./assets/emoji_smile_specular.png'),
                     require('./assets/emoji_smile_normal.png')]}
        />
        <ViroText
          text = {distance ? distance.toFixed(2) + 'cm' : ''}
          scale = {[0.1, 0.1, 0.1]}
          position = {[0, 0, -0.05]}
          style = {styles.helloWorldTextStyle}
        />
      </ViroNode >
    </ViroARScene>
  )
}


export default () => {
  return (
    <ViroARSceneNavigator
      autofocus = {true}
      initialScene = {{scene: MeasureSceneAR}}
      style = {styles.f1}
    />
  );
};

var styles = StyleSheet.create({
  f1: {
    flex: 1
  },
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});
