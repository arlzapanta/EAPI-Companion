import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { lightTheme, darkTheme } from './themes'; 

interface styleUtilProps {
  theme?: 'dark' | 'light';
}

export const getStyleUtil = ({ theme = 'dark' }: styleUtilProps) => {
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return {
    // ***************************************************************************************
    // *  DEFAULT STYLES
    // ***************************************************************************************
    container: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: currentTheme.titleColor,
    } as TextStyle,
    button: {
      backgroundColor: currentTheme.buttonColor,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      width: 400,
    } as ViewStyle,
    buttonText: {
      color: currentTheme.buttonTextColor,
      fontSize: 16,
      fontWeight: 'bold',
    } as TextStyle,
    input: {
      width: '100%',
      padding: 10,
      marginBottom: 10,
      borderColor: currentTheme.inputBorderColor,
      borderWidth: 1,
      borderRadius: 4,
      color: currentTheme.textColor,
      caretColor: currentTheme.caretColor,
    } as ViewStyle,
    buttonContainer: {
      width: '100%',
      padding: 12,
      backgroundColor: currentTheme.buttonColor,
      borderRadius: 4,
      alignItems: 'center',
      marginTop: 10,
    } as ViewStyle,
    buttonContainerLogout: {
      padding: 12,
      backgroundColor: currentTheme.buttonColor,
      borderRadius: 4,
      alignItems: 'center',
      paddingVertical: 10,
    } as ViewStyle,
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
    // ***************************************************************************************
    // *  HOME STYLES
    // ***************************************************************************************
    homeContainer_home: {
      flex: 1,
      backgroundColor: currentTheme.containerBackgroundColor,
      flexDirection: 'row',
    } as ViewStyle,
    homeText_home: {
      color: currentTheme.textColor, 
    } as TextStyle,
    navContainer_home: {
      backgroundColor: currentTheme.containerBackgroundColor,
      paddingVertical: 10,
      paddingHorizontal: 10,
      width: 70,
    } as ViewStyle,
    contentContainer_home: {
      flex: 1,
      backgroundColor: currentTheme.containerBackgroundColor,
      padding: 10,
    },
    // ***************************************************************************************
    // *  SETTING STYLES
    // ***************************************************************************************
    container_settings: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    title_settings: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: currentTheme.titleColor,
    } as TextStyle,
    button_settings: {
      backgroundColor: currentTheme.buttonColor,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      width: 400,
    } as ViewStyle,
    buttonText_settings: {
      color: currentTheme.buttonTextColor,
      fontSize: 16,
      fontWeight: 'bold',
    } as TextStyle,
    // ***************************************************************************************
    // *  NAVLINK STYLES
    // ***************************************************************************************
    navLink: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: currentTheme.textColor, 
      borderRadius: 10,
      marginVertical: 5,
    } as ViewStyle,
    activeNavLink: {
      backgroundColor: '#2d8b4b',
    },
    navIcon: {
      fontSize: 30,
      color: currentTheme.textColor,
    },
    activeNavIcon: {
      color: '#ffffff',
    },
   // ***************************************************************************************
    // *  DASHBOARD STYLES
    // ***************************************************************************************
    chartBackgroundColor: {
      backgroundColor: currentTheme.chartBackgroundColor,
    },
    container_dashboard: {
      flex: 1,
      padding: 16,
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    announcementContainer_dashboard: {
      padding: 16,
      backgroundColor: currentTheme.announcementBackgroundColor,
      marginBottom: 16,
    } as ViewStyle,
    chartContainer_dashboard: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginHorizontal: 8,
    } as ViewStyle,
    chartRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    } as ViewStyle,
    chart_dashboard: {
      flex: 1,
      marginHorizontal: 8,
      backgroundColor: currentTheme.chartBackgroundColor,
      padding: 16,
      borderRadius: 8,
    } as ViewStyle,
    text_dashboard: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.textColor,
    } as TextStyle,
    subtext_dashboard: {
      fontSize: 15,
      color: currentTheme.textColor,
    } as TextStyle,
    announcementImage: {
      width: '100%', 
      height: 100,   
      borderRadius: 8,
      marginTop: 10,
      resizeMode: 'stretch',
    } as ImageStyle,
  };
};
