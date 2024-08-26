import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { API_URL } from '../app/context/AuthContext';
import axios from 'axios'

const Home = () => {
	const [users, setUsers] = useState<any[]>([]);

	useEffect(()=> {
		const loadUser = async () => {
			try {
				const result = await axios.get(`${API_URL}/users`);
				setUsers(result.data);
				console.log('testCall login' , result);
			} catch (error: any) {
				alert(error.message);
			}
		}
		loadUser();
	})
	return (
		<View>
			<Text>Home</Text>
		</View>
	)
}

export default Home;