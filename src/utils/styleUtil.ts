import { ViewStyle, TextStyle } from 'react-native';

interface styleUtilProps {
  buttonColor?: string;
  inputBorderColor?: string;
  titleColor?: string;
  caretColor?: string; 
}

export const getstyleUtil = ({
  buttonColor = '#046f37',
  inputBorderColor = '#ccc',
  titleColor = '#000',
  caretColor = '#046f37', 
}: styleUtilProps) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as ViewStyle,
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: titleColor,
  } as TextStyle,
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderColor: inputBorderColor,
    borderWidth: 1,
    borderRadius: 4,
    color: '#000', 
    caretColor: caretColor,
  } as ViewStyle,
  buttonContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: buttonColor,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  } as ViewStyle,
  buttonContainerLogout: {
    padding: 12,
    backgroundColor: buttonColor,
    borderRadius: 4,
    alignItems: 'center',
    paddingVertical: 10,
  } as ViewStyle,
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  iconContainer: {
    paddingRight: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    width: 150,
    elevation: 5,
    alignItems: 'center' as ViewStyle['alignItems'],
  } as ViewStyle,
});
