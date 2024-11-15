import {
  ViewStyle,
  TextStyle,
  ImageStyle,
  Dimensions,
  View,
} from "react-native";
import { lightTheme, darkTheme } from "./themes";
import { StyleSheet } from "react-native";
const { width, height } = Dimensions.get("window");

export const getStyleUtil = ({ theme = "light" }: styleUtilProps) => {
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  return {
    // ***************************************************************************************
    // *  DEFAULT STYLES
    // ***************************************************************************************
    container: {
      flex: 1,
      paddingTop: width >= 1280 ? width * 0.02 : width * 0.002,
      backgroundColor: currentTheme.containerSubBackgroundColor,
    } as ViewStyle,
    subContainer: {
      flex: 1,
      padding: width * 0.02,
      backgroundColor: "transparent",
    } as ViewStyle,
    mainBgColor: {
      backgroundColor: currentTheme.containerBackgroundColor,
    },
    mainColor: {
      color: currentTheme.containerBackgroundColor,
    },
    subBgColor: {
      backgroundColor: currentTheme.containerSecondaryBackgroundColor,
    },
    accordionButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#e9ecef",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginVertical: 10,
    } as ViewStyle,
    accordionTitle: {
      fontSize: 16,
      color: "#046E37",
    } as ViewStyle,
    accordionContent: {
      backgroundColor: "#f8f9fa",
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 8,
    } as ViewStyle,
    columnTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#343a40",
      marginBottom: 8,
    } as TextStyle,
    columnSubTitle: {
      fontSize: 16,
      color: "#6c757d",
    } as TextStyle,
    buttonContainerDisabled: {
      backgroundColor: "lightgray",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginBottom: 10,
      elevation: 5,
    } as ViewStyle,
    scrollViewContainer: {
      alignItems: "center",
      justifyContent: "center",
      flexGrow: 1,
    } as ViewStyle,
    scrollViewDoctorContainer: {
      alignItems: "center",
      justifyContent: "center",
      flexGrow: 1,
    } as ViewStyle,
    scrollViewQuickContainer: {
      flexGrow: 1,
    } as ViewStyle,
    innerScrollStyle: {
      flex: 1,
      backgroundColor: "transparent",
      paddingHorizontal: 10,
    } as ViewStyle,
    card: {
      flex: 1,
      marginVertical: 10,
      marginStart: 20,
      marginEnd: 10,
      paddingVertical: 40,
      backgroundColor: "#ffffff",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
      margin: 10,
    } as ViewStyle,
    cardBottomSheet: {
      flex: 1,
      backgroundColor: "#ffffff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    } as ViewStyle,
    icon: {
      marginLeft: 10,
      color: currentTheme.containerBackgroundColor,
    },
    floatingButtonContainer: {
      position: "absolute",
      bottom: width >= 1280 ? 20 : 15,
      right: width >= 1280 ? 20 : 15,
      backgroundColor: "#046E37",
      opacity: 0.9,
      borderRadius: 5,
      padding: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    } as ViewStyle,
    trioBtnRow: {
      flexDirection: "row",
      // justifyContent: "center",
      justifyContent: "space-around",
      minWidth: 60,
    } as ViewStyle,
    buttonContainer1: {
      backgroundColor: "#046E37",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      elevation: 5,
      maxWidth: 200,
      minWidth: 200,
      marginBottom: 2,
      alignItems: "center",
    } as ViewStyle,
    buttonCancelContainer: {
      backgroundColor: "red",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      elevation: 5,
      maxWidth: 200,
      minWidth: 200,
      marginBottom: 2,
      marginTop: 20,
      alignItems: "center",
    } as ViewStyle,
    buttonSubContainer1: {
      backgroundColor: "#046E37",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      elevation: 5,
      marginBottom: 2,
      alignItems: "center",
    } as ViewStyle,
    buttonContainerDoctors: {
      alignContent: "center",
      justifyContent: "center",
      height: 50,
      backgroundColor: "#046E37",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      elevation: 5,
      marginBottom: 2,
      alignItems: "center",
    } as ViewStyle,
    floatingButton: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 60,
    } as ViewStyle,
    card1Col: {
      flex: 1,
      justifyContent: "center",
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
      flex: 1,
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
    mainTextRed: {
      color: "red",
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
    containerSubLoading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: currentTheme.mainContainerBG,
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
      flexDirection: "column",
      alignContent: "center",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    resetButton: {
      backgroundColor: currentTheme.containerSecondaryBackgroundColor,
      marginLeft: 10,
      width: Dimensions.get("window").width * 0.2,
      borderRadius: 5,
    },
    centerItems: {
      alignContent: "center",
      alignItems: "center",
    } as ViewStyle,
    title: {
      fontSize: 24,
      fontWeight: "bold",
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
      alignItems: "center",
      width: 400,
      marginVertical: 8,
    } as ViewStyle,
    buttonText: {
      color: currentTheme.buttonTextColor,
      fontSize: 16,
      fontWeight: "bold",
    } as TextStyle,
    input: {
      width: "100%",
      padding: 10,
      marginBottom: 10,
      borderColor: currentTheme.inputBorderColor,
      borderWidth: 1,
      borderRadius: 4,
      maxWidth: 450,
      color: currentTheme.textColor,
      caretColor: currentTheme.caretColor,
    } as ViewStyle,
    inputPWicon: {
      width: "100%",
      padding: 10,
      marginBottom: 10,
      borderColor: currentTheme.inputBorderColor,
      borderWidth: 1,
      borderRadius: 4,
      maxWidth: 450,
      color: currentTheme.textColor,
      caretColor: currentTheme.caretColor,
    } as ViewStyle,
    inputDoctors: {
      width: "100%",
      padding: 10,
      marginBottom: 10,
      marginEnd: 10,
      borderColor: currentTheme.inputBorderColor,
      borderWidth: 1,
      borderRadius: 4,
      maxWidth: 200,
      minHeight: 50,
      maxHeight: 50,
      color: "black",
      caretColor: currentTheme.caretColor,
    } as ViewStyle,
    buttonContainer: {
      width: "100%",
      padding: 15,
      backgroundColor: currentTheme.buttonColor,
      borderRadius: 4,
      alignItems: "center",
      maxWidth: 450,
      marginTop: 10,
    } as ViewStyle,
    buttonLogout: {
      width: "100%",
      padding: 15,
      backgroundColor: "#d9534f",
      borderRadius: 4,
      alignItems: "center",
      maxWidth: 450,
      marginTop: 10,
    } as ViewStyle,
    isLoadingButtonContainer: {
      width: "100%",
      padding: 15,
      backgroundColor: currentTheme.containerSecondaryBackgroundColor,
      borderRadius: 4,
      alignItems: "center",
      maxWidth: 450,
      marginTop: 10,
    } as ViewStyle,
    textWhite: {
      color: "white",
    } as TextStyle,
    textBlack: {
      color: "black",
    } as TextStyle,
    textDwhite: {
      color: "#E8E4C9",
    } as TextStyle,
    textSubColor: {
      color: currentTheme.containerSubBackgroundColor,
    } as TextStyle,
    buttonContainerLogout: {
      padding: 12,
      backgroundColor: currentTheme.buttonColor,
      borderRadius: 4,
      alignItems: "center",
      paddingVertical: 10,
    } as ViewStyle,
    iconContainer: {
      paddingRight: 10,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    } as ViewStyle,
    dropdownMenu: {
      backgroundColor: "#fff",
      borderRadius: 5,
      padding: 10,
      width: 150,
      elevation: 5,
      alignItems: "center" as ViewStyle["alignItems"],
    } as ViewStyle,
    buttonDisabled: {
      backgroundColor: "#B0BEC5",
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
    } as ViewStyle,
    picker: {
      width: Dimensions.get("window").width * 0.55,
      height: 40,
      backgroundColor: "#f9f9f9",
      borderRadius: 4,
      borderColor: "#ddd",
      borderWidth: 1,
    },
    picker1col: {
      // width: Dimensions.get("window").width * 0.16,
      marginBottom: 15,
      width: "100%",
      backgroundColor: "#f9f9f9",
      borderRadius: 14,
      borderColor: "#ddd",
      borderWidth: 1,
    } as ViewStyle,
    pickerInitialLabel: {
      color: "lightgray",
    },
    pickerLabel: {
      color: "black",
    },
    filterMainContainer: {} as ViewStyle,
    cardItems: {
      width: "100%",
      padding: 15,
      borderWidth: 1.5,
      borderColor: currentTheme.containerBackgroundColor,
      backgroundColor: "#ffffff",
      borderRadius: 8,
      marginVertical: 4,
    } as ViewStyle,
    cardDoneItems: {
      width: "100%",
      padding: 15,
      borderWidth: 1.5,
      borderColor: currentTheme.containerBackgroundColor,
      backgroundColor: currentTheme.containerBackgroundColor,
      borderRadius: 8,
      marginVertical: 4,
    } as ViewStyle,
    cardItemText: {
      fontSize: 16,
      color: "#343a40",
    } as TextStyle,
    cardDoneItemText: {
      fontSize: 16,
      color: "white",
    } as TextStyle,
    detailCard: {
      flexDirection: "row",
      flexWrap: "wrap", // Wrap content to multiple lines if needed
      paddingHorizontal: 10,
    } as ViewStyle,
    detailList: {
      padding: 10,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: "#FFFFFF",
      borderRadius: 8,
      marginVertical: 5,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } as ViewStyle,
    detailCustomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: currentTheme.containerSubBackgroundColor,
      borderRadius: 8,
      marginVertical: 5,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } as ViewStyle,
    noteRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      marginVertical: 4,
      marginEnd: 8,
      padding: 10,
      backgroundColor: currentTheme.containerSubBackgroundColor,
      borderRadius: 5,
    } as ViewStyle,
    noteLabel: {
      flex: 1,
      fontWeight: "bold",
      color: "#343a40",
    } as TextStyle,
    noteValue: {
      flex: 2,
      color: "#6c757d",
    } as TextStyle,
    imageContainer: {
      marginTop: 20,
      alignItems: "center",
    } as ViewStyle,
    image: {
      width: 400,
      height: 260,
      marginTop: 10,
      resizeMode: "contain",
    } as ImageStyle,
    thumbnailImage: {
      width: 400,
      height: 260,
      marginTop: 10,
      resizeMode: "contain",
    } as ImageStyle,
    // ***************************************************************************************
    // *  HOME STYLES
    // ***************************************************************************************
    homeContainer_home: {
      flex: 1,
      backgroundColor: currentTheme.containerSubBackgroundColor,
      flexDirection: "row",
    } as ViewStyle,
    navContainer_home: {
      backgroundColor: currentTheme.containerBackgroundColor,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
    components_container: {
      flex: 1,
    } as ViewStyle,
    row: {
      flexDirection: "row",
      flex: 1,
    } as ViewStyle,
    rowItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 15,
      borderRadius: 8,
    } as ViewStyle,
    columnItem: {
      marginHorizontal: 10,
      flexDirection: "column",
    } as ViewStyle,
    column1: {
      width: "30%",
    } as ViewStyle,
    column2: {
      width: "70%",
    } as ViewStyle,
    // ***************************************************************************************
    // *  LOGIN STYLES
    // ***************************************************************************************
    containerLogin: {
      flex: 1,
      paddingTop: width >= 1280 ? width * 0.02 : width * 0.002,
      padding: 2,
      backgroundColor: currentTheme.containerSecondaryBackgroundColor,
    } as ViewStyle,
    cardLogin: {
      justifyContent: "center",
      borderRadius: 5,
      backgroundColor: "#fff",
      height: "100%",
    } as ViewStyle,
    // ***************************************************************************************
    // *  ACTUAL STYLES
    // ***************************************************************************************
    signatureImg: {
      flex: 1,
      resizeMode: "cover",
      minHeight: 100,
      maxWidth: 600,
    } as ImageStyle,
    inner2ActualContainer: {
      flex: 1,
      borderRadius: 10,
      paddingHorizontal: 40,
      paddingVertical: 15,
      backgroundColor: "#e9ecef",
      borderColor: "#046E37",
      borderWidth: 1,
    } as ViewStyle,
    // ***************************************************************************************
    // *  REQUEST RESCHEDULE STYLES
    // ***************************************************************************************
    requestContainer: {
      flex: 1,
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 40,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      marginRight: 10,
    } as ViewStyle,
    historyContainer: {
      flex: 1,
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 40,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    } as ViewStyle,
    dropdownContainer: {
      width: "100%",
      padding: 20,
    } as ViewStyle,
    // ***************************************************************************************
    // *  DOCTOR SCREEN STYLES
    // ***************************************************************************************

    // ***************************************************************************************
    // *  SETTING STYLES
    // ***************************************************************************************
    title_settings: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: currentTheme.titleColor,
    } as TextStyle,
    title_stack_settings: {
      fontSize: 24,
      fontWeight: "bold",
      left: 60,
      marginBottom: 20,
      color: currentTheme.titleColor,
    } as TextStyle,
    button_settings: {
      backgroundColor: currentTheme.buttonColor,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: "center",
      width: 400,
    } as ViewStyle,
    button_logout: {
      backgroundColor: "red",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: "center",
      width: 400,
      marginVertical: 16,
    } as ViewStyle,
    buttonText_settings: {
      color: currentTheme.buttonTextColor,
      fontSize: 20,
      fontWeight: "bold",
    } as TextStyle,
    // ***************************************************************************************
    // *  NAVLINK STYLES
    // ***************************************************************************************
    navLink: {
      backgroundColor: currentTheme.containerBackgroundColor,
      // backgroundColor: "black",
      paddingTop: width >= 835 ? 15 : 0,
      marginVertical: width >= 835 ? 15 : 2,
      marginStart: width >= 835 ? 10 : 2,
      marginEnd: width >= 835 ? 10 : 2,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    activeNavLink: {
      backgroundColor: currentTheme.containerSecondaryBackgroundColor,
      paddingVertical: width >= 835 ? 15 : 6,
      marginVertical: width >= 835 ? 15 : 6,
      marginStart: width >= 835 ? 10 : 3,
      minWidth: width >= 835 ? 80 : 50,
      borderRadius: 10,
    },
    navLinkBox: {
      backgroundColor: currentTheme.containerBackgroundColor,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      marginVertical: 5,
    } as ViewStyle,
    navLinkBoxActive: {
      backgroundColor: currentTheme.containerSubBackgroundColor,
      // marginEnd: -10,
    } as ViewStyle,
    navIcon: {
      fontSize: width >= 835 ? 32 : 25,
      color: currentTheme.containerSubBackgroundColor,
    },
    activeNavIcon: {
      color: currentTheme.containerBackgroundColor,
      fontSize: width >= 835 ? 30 : 22,
    },
    navText: {
      fontSize: 8,
      color: currentTheme.mainContainerBG,
    } as TextStyle,
    activeNavText: {
      display: "none",
    } as TextStyle,
    navLinkBoxTopDesign: {
      height: 0,
    } as ViewStyle,
    navLinkBoxBottomDesign: {
      height: 0,
    } as ViewStyle,
    navLinkBoxTopDesignActive: {
      height: 10,
      // maxWidth: 95,
      backgroundColor: currentTheme.containerBackgroundColor,
      borderBottomEndRadius: 20,
    } as ViewStyle,
    navLinkBoxBottomDesignActive: {
      height: 10,
      // maxWidth: 95,
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
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: currentTheme.containerBackgroundColor,
    } as ViewStyle,
    announcementContainer_dashboard: {
      padding: 16,
      backgroundColor: currentTheme.announcementBackgroundColor,
      marginBottom: 16,
    } as ViewStyle,
    chartRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    } as ViewStyle,
    chart_dashboard: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: currentTheme.chartBackgroundColor,
      padding: 16,
    } as ViewStyle,
    text_dashboard: {
      fontSize: 18,
      fontWeight: "bold",
      color: currentTheme.textColor,
    } as TextStyle,
    subtext_dashboard: {
      fontSize: 15,
      color: currentTheme.textColor,
    } as TextStyle,
    announcementImage: {
      width: "100%",
      height: 100,
      borderRadius: 8,
      marginTop: 10,
      resizeMode: "cover",
    } as ImageStyle,
    // *************************************
    // *  TABLE - STYLES
    // *************************************
    tableCard: {
      marginTop: 20,
      backgroundColor: "#fff",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    tableHeader: {
      backgroundColor: "#FAF9F6",
    },
    tableRow: {
      borderBottomWidth: 1,
      borderBottomColor: "lightgray",
    },
    paginationContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 15,
    } as ViewStyle,
    paginationButton: {
      flex: 1,
      marginHorizontal: 5,
      borderColor: "#046E37",
    },
    paginationText: {
      flex: 2,
      textAlign: "center",
      color: "black",
    } as TextStyle,
    disabledButton: {
      borderColor: "gray",
    },
    disabledText: {
      color: "gray",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      height: Dimensions.get("window").height * 0.5,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.02)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    } as ViewStyle,
    // *************************************
    // *  DASH BOARD - CHART STYLES
    // *************************************
    card_chart: {
      padding: 40,
      flex: 1,
      minWidth: 500,
      borderRadius: 20,
      // backgroundColor: currentTheme.chartColor,
    },
    title_chart: {
      color: "black",
      fontSize: 16,
      marginBottom: 15,
      fontWeight: "bold",
    } as TextStyle,
    legendContainer_chart: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 10,
    } as ViewStyle,
    legendItem_chart: {
      flexDirection: "row",
      alignItems: "center",
      width: 120,
      marginRight: 20,
    } as ViewStyle,
    legendText_chart: {
      color: "white",
    },
    dot_chart: {
      height: 10,
      width: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    // daily chart
    centerLabelContainer_dailyChart: {
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
    centerLabelText_dailyChart: {
      fontSize: 22,
      color: "black",
      fontWeight: "bold",
    } as TextStyle,
    centerLabelSubtext_dailyChart: {
      fontSize: 14,
      color: "black",
    },
    //actual target chart
    referenceLine_actualvTarget: {
      position: "absolute",
      width: "100%",
      height: 2,
      backgroundColor: "#FF0000",
      left: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    referenceLineText_actualvTarget: {
      color: "#FF0000",
      fontWeight: "bold",
      fontSize: 14,
    },
  };
};
