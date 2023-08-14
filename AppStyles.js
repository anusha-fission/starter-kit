import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  recordButton: {
    padding: 10,
    position: 'absolute',
    bottom: 30,
    left: '40%',
    borderRadius: 16,
    backgroundColor: 'red',
  },
  recordButton1: {
    padding: 10,
    position: 'absolute',
    bottom: 30,
    left: '20%',
    borderRadius: 16,
    backgroundColor: 'red',
  },
  recordText: {
    textTransform: 'capitalize',
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
});

export default styles;
