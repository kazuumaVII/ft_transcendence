import React, { useState, useEffect, FC } from 'react';
import './onlineGame.scss';
import { useSpring, animated } from 'react-spring';
import { useMainPage } from '../../../../MainPageContext';
import { AvatarGroup, Avatar, Badge, CircularProgress } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { OnlineGameType, OnlineGameAndMapType } from '../../../type';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

interface Props {
	Loadingclick: () => void;
}

interface MapProps {
	data: OnlineGameType;

	loading: boolean;

	gameWs: Socket | undefined;
}

const ListGame: FC<MapProps> = ({ data, loading, gameWs }) => {
	const [time, setTime] = useState(false);
	let navigate = useNavigate();
	const {
		loadingSocket,
		setWatchGameScore,
		setStartGame,
		setSelectNav,
		setIsWatchGame,
	} = useMainPage();

	const handleClick = async (watch: string) => {
		gameWs?.emit('watchGame', watch, (response: OnlineGameAndMapType) => {
			// console.log(`CLIENT: response from server -> `, response);
			setWatchGameScore(() => response);
		});
		setTime(true);
		setTimeout(function () {
			setTime(false);
			setIsWatchGame(true);
			setStartGame(true);
			setSelectNav(false);
			navigate('/Mainpage');
		}, 1000);
	};

	return (
		<div className="partyOnline d-flex ">
			<div className="userImg d-flex">
				<AvatarGroup max={2}>
					<Badge
						overlap="circular"
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						variant="dot"
						sx={{}}
					>
						<Avatar
							alt="userImg"
							src={data.challenger.photo_url}
							variant="square"
							className="domUser"
						/>
					</Badge>
					<Badge
						overlap="circular"
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						variant="dot"
						sx={{}}
					>
						<Avatar
							alt="userImg"
							src={data.opponent.photo_url}
							variant="rounded"
							className="extUser"
						/>
					</Badge>
				</AvatarGroup>
			</div>

			<div className="userStat d-flex flex-column ">
				<div className="player d-flex ">
					<div className="user challenger ">
						<p>{data.challenger.login}</p>
					</div>
					<div className="vs">
						<p>vs</p>
					</div>
					<div className="user opponant">
						<p>{data.opponent.login}</p>
					</div>
				</div>
				<div className="score d-flex">
					<div className="scoreUser">
						<p>{data.challenger.score}</p>
					</div>
					<div className="semiliconGame">
						<p>:</p>
					</div>
					<div className="scoreUser">
						<p>{data.opponent.score}</p>
					</div>
				</div>
			</div>
			<div className="userWatch d-flex  ">
				<LoadingButton
					className="muiButton"
					onClick={() => handleClick(data.watch)}
					disabled={!loadingSocket || loading || time}
					variant="contained"
					sx={{
						borderRadius: 4,
						width: 2 / 2,
						height: 2 / 2,
						textTransform: 'none',
						backgroundColor: '#E69C6A',
					}}
				>
					{(loading || time) && <CircularProgress size="1.2em" />}
					{!loading && !time && 'Watch'}
				</LoadingButton>
			</div>
		</div>
	);
};

export default function OnlineGame({ Loadingclick }: Props) {
	const { setSelectQuery, gameWs, loading, startGame, open } = useMainPage();
	const props = useSpring({
		opacity: 1,
		transform: 'translate(0px, 0px)',
		from: { opacity: 0, transform: 'translate(0px, 5vw)' },
		config: {
			delay: 300,
			duration: 300,
		},
	});

	const [data, setData] = useState<OnlineGameType[]>([]);
	const [isprintData, setIsPrintData] = useState(false);

	const fetchDataOnLineGame = async () => {
		try {
			const { data } = await axios.get(
				`http://${
					process.env.REACT_APP_BASE_URL || 'localhost:3000'
				}/game/onlineGames`,
				{
					withCredentials: true,
				},
			);
			setData(data);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		setSelectQuery(true);

		fetchDataOnLineGame();
		if (open) {
			fetchDataOnLineGame();
		}

		setIsPrintData(true);
		gameWs?.on('newOnlineGame', (obj) => {
			console.log(`💌  Event: newOnlineGame -> `, obj);

			setData((s) => [obj, ...s]);
		});

		return () => {
			setSelectQuery(false);
			gameWs?.off('newOnlineGame');
		};
	}, [gameWs, open]);

	const scoreSort = (a: OnlineGameType, b: OnlineGameType) => {
		return b.createdAt - a.createdAt;
	};

	return (
		<animated.div style={props} className="w-100">
			<div className="mainOnlineGame d-flex flex-column ">
				<div className="title">
					<h1>Online game</h1>
				</div>
				<div className="pageOverflow">
					<div className="onlineDiv">
						{data &&
							data.sort(scoreSort).map((data, index: number) => (
								<React.Fragment key={index}>
									<ListGame data={data} loading={loading} gameWs={gameWs} />
								</React.Fragment>
							))}
					</div>
				</div>
			</div>
		</animated.div>
	);
}
