import { ViewStyle, TextStyle, ImageStyle, Dimensions } from 'react-native';
import { lightTheme, darkTheme } from './themes'; 

export const getStyleUtil = ({ theme = 'light' }: styleUtilProps) => {
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return {
    // ***************************************************************************************
    // *  DEFAULT STYLES
    // ***************************************************************************************
    container: {
      flex: 1,
      backgroundColor: currentTheme.containerSubBackgroundColor,
    } as ViewStyle,
    mainBgColor : {
      backgroundColor : currentTheme.containerBackgroundColor
    },
    card: {
      height: 740,
      padding: 40,
      backgroundColor: "#ffffff",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    } as ViewStyle,
    cardBottomSheet: {
      flex:1,
      minHeight:550,
      backgroundColor: "#ffffff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    } as ViewStyle,
    floatingButtonContainer: {
      position: "absolute",
      bottom: 40,
      right: 50,
      backgroundColor: "#046E37",
      opacity: 0.9,
      borderRadius: 10,
      padding: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    } as ViewStyle,
    floatingButton: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 60,
    } as ViewStyle,
    card1Col: {
      height: 740,
      padding: 40,
      backgroundColor: "#ffffff",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
      marginVertical: 10,
      marginStart: 20,
    } as ViewStyle,
    card2Col: {
      height: 740,
      padding: 20,
      paddingVertical: 20,
      backgroundColor: "#ffffff",
      borderRadius: 10,
      elevation: 5,
      marginVertical: 10,
      marginStart: 10,
      marginEnd: 10, 
    } as ViewStyle,
    mainText: {
      color: currentTheme.containerBackgroundColor,
      fontSize: 16,
      fontWeight: "bold",
    } as TextStyle,
    mainTextBig: {
      color: currentTheme.containerBackgroundColor,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 2,
    } as TextStyle,
    mainTextWhite: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    } as TextStyle,
    containerLoading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: currentTheme.containerSubBackgroundColor,
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
    } as ViewStyle,
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
    filterContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    }as ViewStyle,
    picker: {
      width: Dimensions.get("window").width * 0.55,
      height: 40,
      backgroundColor: "#f9f9f9",
      borderRadius: 4,
      borderColor: "#ddd",
      borderWidth: 1,
    },
    picker1col: {
      width: Dimensions.get("window").width * 0.16,
      backgroundColor: "#f9f9f9",
      borderRadius: 4,
      borderColor: "#ddd",
      borderWidth: 1,
    },
    pickerInitialLabel: {
      color: "lightgray",
    },
    pickerLabel: {
      color: "black",
    },
    resetButton: {
      backgroundColor: "#046E37",
      marginLeft: 10,
      width: Dimensions.get("window").width * 0.2,
      borderRadius: 5,
    },
    filterMainContainer: {
      padding: 20,
      marginVertical: 5,
      borderRadius: 10,
      borderWidth:1,
      borderColor: currentTheme.containerBackgroundColor
    } as ViewStyle,
    // ***************************************************************************************
    // *  HOME STYLES
    // ***************************************************************************************
    homeContainer_home: {
      flex: 1,
      backgroundColor: currentTheme.containerSubBackgroundColor,
      flexDirection: 'row',
      // marginTop: 20,
      // marginEnd: 20,
      // marginBottom: 10
      paddingTop: 20,
    } as ViewStyle,
    homeText_home: {
      color: currentTheme.textColor, 
    } as TextStyle,
    navContainer_home: {
      marginTop: -20, 
      paddingStart: 5,
      backgroundColor: currentTheme.containerBackgroundColor,
      justifyContent: 'center', 
      alignItems: 'center', 
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
    } as ViewStyle,
    contentContainer_home: {
      flex: 1,
      backgroundColor: currentTheme.containerSubBackgroundColor,
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
      backgroundColor: currentTheme.containerBackgroundColor,
      // backgroundColor: "black",
      padding: 15,
      borderRadius: 10,
      marginVertical: 15,
      marginStart: 10,
      marginEnd: 15,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    activeNavLink: {
      backgroundColor: currentTheme.containerSecondaryBackgroundColor,
      paddingVertical: 15,
      minWidth: 80
    },
    navLinkBox: {
      backgroundColor: currentTheme.containerBackgroundColor,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      marginVertical: 5,
    }as ViewStyle,
    navLinkBoxActive: {
      backgroundColor: currentTheme.containerSubBackgroundColor,
      marginEnd: -10,
    } as ViewStyle,
    navIcon: {
      fontSize: 32,
      color: currentTheme.containerSubBackgroundColor,
    },
    activeNavIcon: {
      color:  currentTheme.containerBackgroundColor,
      fontSize: 30
    },
    navLinkBoxTopDesign: {
      height: 0,
    } as ViewStyle,
    navLinkBoxBottomDesign: {
      height: 0,
    } as ViewStyle,
    navLinkBoxTopDesignActive: {
      height: 10,
      maxWidth: 95,
      backgroundColor: currentTheme.containerBackgroundColor,
      borderBottomEndRadius: 20,
    } as ViewStyle,
    navLinkBoxBottomDesignActive: {
      height: 10,
      maxWidth: 95,
      borderTopRightRadius: 20,
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
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
