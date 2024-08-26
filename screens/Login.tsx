import { View, Button, TextInput, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth, API_URL } from '../app/context/AuthContext';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {onLogin} = useAuth();

		useEffect(()=> {
			const testCall = async () => {
				const result = await axios.get(`${API_URL}/users`);
				console.log('testCall login' , result);
			}
			testCall();
		})

		const login = async() => {
			const result = await onLogin!(email,password);
			if(result && result.error){
				alert(result.msg);
			}
		};

  return (
		<View style={styles.container}>
		<View style={styles.form}>
			<TextInput style={styles.form}
				placeholder='Email'
				value={email}
				onChangeText={(text: string)=> setEmail(text)}
			/>
			<TextInput
				placeholder='Password'
				secureTextEntry
				value={password}
				onChangeText={(text: string)=> setPassword(text)}
			/>
			<Button title='Login' onPress={login} />
		</View>
	</View>
  )
}

const styles = StyleSheet.create({
  image: {
		width: '50%',
		height: '50%',
		resizeMode: 'contain',
	},
	form: {
		gap: 10,
		width: '60%',
	},
	input: {
		height: 44,
		borderWidth: 1,
		borderRadius: 4,
		padding: 10,
		backgroundColor: '#fff',
	},
	container: {
		alignItems: 'center',
		width: '100%'
	}
});

export default Login;