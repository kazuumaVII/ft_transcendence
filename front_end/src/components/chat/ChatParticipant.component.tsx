import styled from "styled-components";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import BlockIcon from '@mui/icons-material/Block';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import axios from "axios";
import { useEffect, useState } from "react";

const ChatParticipant = ({ user, currentUser }: any) => {

	const [friends, setFriends] = useState<any[]>([]);
	const [friendsLoading, setFriendsLoading] = useState<boolean>(false);

	const getFriends = async () => {
		setFriendsLoading(true);
		const result = await axios.get("http://localhost:3000/users/friend", { withCredentials: true }).catch(console.error);
		setFriends(result?.data || []);
		setFriendsLoading(false);
	};

	const isFriend = () => {
		const result = friends.filter((friend: any) => friend.id === user.user.id);
		return result.length > 0;
	};

	const addFriend = async (id: any) => {
		setFriendsLoading(true);
		await axios.post(`http://localhost:3000/users/friend`, {
			id
		}, { withCredentials: true });
		window.dispatchEvent(new CustomEvent("friendsUpdated", { detail: {} }));
		getFriends();
	};

	const removeFriend = async (id: any) => {
		setFriendsLoading(true);
		await axios.delete(`http://localhost:3000/users/friend`, {
			withCredentials: true,
			data: {
				id
			}
		});
		window.dispatchEvent(new CustomEvent("friendsUpdated", { detail: {} }));
		getFriends();
	};

	const askGame = async (id: any) => {
		// ?
	};

	const blockUser = async (id: any) => {
		await axios.post(`http://localhost:3000/users/block`, {
			id
		}, { withCredentials: true });
	};

	useEffect(() => {
		getFriends();
	}, []);

	return (
		<>
			<DetailsView>
				<img src={user.user.photo_url} alt={user.user.login} />
				<h3>{ user.user.login }</h3>
			</DetailsView>
			{ currentUser.id !== user.user.id && (<ButtonRow>
				{!friendsLoading && !isFriend() && <button onClick={ () => addFriend(user.user.id) }><PersonAddIcon /></button>}
				{!friendsLoading && isFriend() && <button onClick={ () => removeFriend(user.user.id) }><PersonOffIcon /></button>}
				<button onClick={ () => askGame(user.user.id) }><SportsEsportsIcon /></button>
				<button onClick={ () => blockUser(user.user.id) }><BlockIcon /></button>
			</ButtonRow>) }
		</>
	);
};

const DetailsView = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	flex-direction: column;

	img {
		width: 60px;
		height: 60px;
		border-radius: 100%;
	}

	h3 {
		margin: 10px;
	}
`;

const ButtonRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;

	button {
		width: 40px;
		height: 40px;
		background-color: #F1F1F1;
		border: none;
		border-radius: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 5px;
	}
`;

export default ChatParticipant;