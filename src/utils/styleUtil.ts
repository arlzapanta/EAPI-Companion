import { ViewStyle, TextStyle, ImageStyle,  } from 'react-native';
import { lightTheme, darkTheme } from './themes'; 

interface styleUtilProps {
  theme?: 'dark' | 'light';
}

export const getStyleUtil = ({ theme = 'light' }: styleUtilProps) => {
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return {
    // ***************************************************************************************
    // *  DEFAULT STYLES
    // ***************************************************************************************
    container: {
      flex: 1,
      padding: 16,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    scrollViewContainer:{
      position: 'relative',
      flex: 1
    } as ViewStyle,
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 60, 
    },
    content: {
      flex: 1,
      padding: 15,
    } as ViewStyle,
    floatingButtonContainer: {
      position: 'absolute',
      top: 15,
      left: 15,
      zIndex: 1000, 
      // backgroundColor: 'rgba(50, 211, 211, 0.8)',
      backgroundColor: 'rgba(4, 110, 55, 0.8)',
      padding: 12,
      borderRadius: 50,
    } as ViewStyle,
    floatingButton: {
      // Add any
    },
    containerCenter: {
      flex: 1,
      padding: 16,
      flexDirection: 'column',
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    centerItems: {
      alignContent: 'center',
      alignItems: 'center',
    }as ViewStyle,
    card: {
      flex:1,
      padding: 30,
      borderRadius: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: currentTheme.titleColor,
    } as TextStyle,
    text: {
      fontSize: 18,
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
      marginVertical: 8,
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
      maxWidth: 450,
      color: currentTheme.textColor,
      caretColor: currentTheme.caretColor,
    } as ViewStyle,
    buttonContainer: {
      width: '100%',
      padding: 15,
      backgroundColor: currentTheme.buttonColor,
      borderRadius: 4,
      alignItems: 'center',
      maxWidth: 450,
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
    buttonDisabled: {
      backgroundColor: '#B0BEC5',
    },
    statusLabel: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 15,
    } as TextStyle,
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
      justifyContent: 'center', 
      alignItems: 'center', 
    } as ViewStyle,
    contentContainer_home: {
      flex: 1,
      backgroundColor: currentTheme.containerBackgroundColor,
    },
    // ***************************************************************************************
    // *  LOGIN STYLES
    // ***************************************************************************************
    containerLogin: {
      flex: 1,
      padding: 16,
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    cardLogin: {
      justifyContent: 'center',
      padding: 30,
      borderRadius: 20,
      backgroundColor: '#fff',
      height: '100%',
    } as ViewStyle,
    // ***************************************************************************************
    // *  SETTING STYLES
    // ***************************************************************************************
    title_settings: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: currentTheme.titleColor,
    } as TextStyle,
    title_stack_settings: {
      fontSize: 24,
      fontWeight: 'bold',
      left: 60,
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
    button_logout: {
      backgroundColor: "red",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      width: 400,
      marginVertical: 16,
    } as ViewStyle,
    buttonText_settings: {
      color: currentTheme.buttonTextColor,
      fontSize: 20,
      fontWeight: 'bold',
    } as TextStyle,
    // ***************************************************************************************
    // *  NAVLINK STYLES
    // ***************************************************************************************
    navLink: {
      width: 40,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: currentTheme.textColor, 
      borderRadius: 10,
      marginVertical: 5,
    } as ViewStyle,
    activeNavLink: {
      backgroundColor: '#046E37',
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
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    announcementContainer_dashboard: {
      padding: 16,
      backgroundColor: currentTheme.announcementBackgroundColor,
      marginBottom: 16,
    } as ViewStyle,
    chartRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    } as ViewStyle,
    chart_dashboard: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentTheme.chartBackgroundColor,
      padding: 16,
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
      resizeMode: 'cover',
    } as ImageStyle,
    // *************************************
    // *  DASH BOARD - CHART STYLES
    // *************************************
    card_chart: {
      padding: 40,
      flex:1,
      minWidth: 500,
      borderRadius: 20,
      // backgroundColor: currentTheme.chartColor,
    },
    title_chart: {
      color: 'black',
      fontSize: 16,
      marginBottom: 15,
      fontWeight: 'bold',
    } as TextStyle,
    legendContainer_chart: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
    } as ViewStyle,
    legendItem_chart: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 120,
      marginRight: 20,
    } as ViewStyle,
    legendText_chart: {
      color: 'white',
    },
    dot_chart: {
      height: 10,
      width: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    // daily chart
    centerLabelContainer_dailyChart: {
      justifyContent: 'center',
      alignItems: 'center',
    }as ViewStyle,
    centerLabelText_dailyChart: {
      fontSize: 22,
      color: 'black',
      fontWeight: 'bold',
    } as TextStyle,
    centerLabelSubtext_dailyChart: {
      fontSize: 14,
      color: 'black',
    },
    //actual target chart 
    referenceLine_actualvTarget: {
      position: 'absolute',
      width: '100%',
      height: 2,
      backgroundColor: '#FF0000',
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    referenceLineText_actualvTarget: {
      color: '#FF0000',
      fontWeight: 'bold',
      fontSize: 14,
    },
  };
};
