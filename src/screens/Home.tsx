import { View, Text } from 'react-native'
import React from 'react'
import axios from 'axios'

const Home = () => {
	console.log(axios.defaults.headers.common['Authorization']);
	return (
		<View>
			<Text>Home</Text>
		</View>
	)
}

export default Home;