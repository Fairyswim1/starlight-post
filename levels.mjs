const rescue=(name,pickup,drop,deadline=null)=>({name,pickup,drop,deadline});
const wall=(x,gap)=>Array.from({length:11},(_,i)=>[x,i-5]).filter(p=>!gap.includes(p[1]));
function mission(id,title,start,rescues,goal,tip,extra={}){return {id,title,start,rescues,goal,tip,bound:5,storms:[],gates:[],switches:[],stations:[],pulses:[],wave:[0],safeHeight:0,fuel:50,capacity:50,limit:60,par:60,chapter:id<=3?'01 · 구조 비행 훈련':id<=6?'02 · 관문과 구조 순서':id<=9?'03 · 폭풍 관측':'04 · 마지막 구조 작전',...extra};}
export const levels=[
 mission(1,'첫 구조 신호',[0,0],[rescue('A',[2,1],[4,2])],[4,2],'빛나는 구조자를 태운 뒤 A 대피소로 이동하세요. 한 번에 한 명을 태울 수 있어요.',{fuel:9,capacity:9,limit:10,par:6}),
 mission(2,'거울처럼 다른 두 섬',[0,0],[rescue('A',[-3,2],[2,-3])],[2,-3],'(-3, 2)와 (2, -3)는 다른 섬이에요. 부호와 순서를 함께 읽으세요.',{fuel:18,capacity:18,limit:19,par:15}),
 mission(3,'빈 좌석 하나',[-4,0],[rescue('A',[-2,2],[2,2]),rescue('B',[-2,-2],[2,-2])],[4,0],'다른 구조자를 지나도 좌석이 차 있으면 태울 수 없어요. 대피소에 내려주고 다음 사람을 구조하세요.',{fuel:30,capacity:30,limit:31,par:24}),
 mission(4,'먼저 구해야 할 사람',[0,0],[rescue('A',[-2,1],[-4,1],7),rescue('B',[1,0],[3,-2])],[0,-3],'가까운 B보다 시한 7턴인 A를 먼저 구해야 해요. 시한에는 탑승이 아니라 대피소 도착이 필요해요.',{fuel:27,capacity:27,limit:28,par:19}),
 mission(5,'닫힌 하늘길',[-4,-2],[rescue('A',[3,1],[4,3])],[4,3],'청록 장치에 닿으면 관문이 열려요. 벽은 지도 끝까지 이어져 있어요.',{storms:wall(0,[0]),switches:[[-2,2]],gates:[{at:[0,0],switch:0}],fuel:25,capacity:25,limit:26,par:17}),
 mission(6,'구조와 관문의 순서',[-4,0],[rescue('A',[-3,-2],[-1,3],12),rescue('B',[3,-2],[4,2])],[4,2],'A의 구조를 끝내고 관문을 열어 B에게 가세요. 관제 장치만 먼저 찾으면 A가 늦어질 수 있어요.',{storms:wall(0,[1]),switches:[[-2,3]],gates:[{at:[0,1],switch:0}],fuel:32,capacity:32,limit:33,par:24}),
 mission(7,'폭풍이 잠드는 순간',[-2,0],[rescue('A',[2,0],[3,1])],[3,1],'파고가 0일 때만 보라색 통로를 건널 수 있어요. 두 칸 뒤 도착할 턴의 그래프를 읽고 대기를 사용하세요.',{storms:wall(0,[0]),pulses:[[0,0]],wave:[0,1,2,1],fuel:12,capacity:12,limit:13,par:8}),
 mission(8,'엇갈린 두 폭풍',[-4,0],[rescue('A',[4,0],[4,2])],[4,2],'두 통로 사이에서 다음 진입 턴을 다시 계산하세요. 현재 파고보다 도착할 때의 파고가 중요해요.',{storms:[...wall(-2,[0]),...wall(2,[0])],pulses:[[-2,0],[2,0]],wave:[0,1,2,1,0,0],fuel:14,capacity:14,limit:18,par:14}),
 mission(9,'우회할까, 기다릴까',[-4,0],[rescue('A',[3,0],[4,2])],[4,2],'폭풍 통로를 기다리는 길과 위쪽 틈으로 우회하는 길을 비교하세요. 이동은 연료를 쓰고 대기는 턴만 써요.',{storms:wall(0,[0,2]),pulses:[[0,0]],wave:[2,2,2,2,2,2,2,2,2,2,0,0],fuel:15,capacity:15,limit:18,par:14}),
 mission(10,'급유소는 한 번뿐',[-4,-2],[rescue('A',[-2,2],[4,2])],[4,2],'연료 8칸으로는 끝까지 갈 수 없어요. 보라색 급유소는 처음 방문할 때만 탱크를 10칸까지 채워요.',{stations:[[0,1]],fuel:8,capacity:10,limit:21,par:16}),
 mission(11,'구름 사이의 긴급 구조',[-4,0],[rescue('A',[-3,2],[-1,2],8),rescue('B',[3,-1],[4,2])],[4,2],'A의 시한, 관제 장치, 급유, 폭풍의 도착 턴을 모두 고려하세요.',{storms:wall(0,[0]),switches:[[-2,1]],gates:[{at:[0,0],switch:0}],pulses:[[0,0]],stations:[[-1,0]],wave:[0,1,2,1],fuel:11,capacity:16,limit:28,par:20}),
 mission(12,'새벽 전 마지막 비행',[-4,0],[rescue('A',[-3,2],[-1,2],8),rescue('B',[3,2],[4,-2]),rescue('C',[2,-3],[-2,-2])],[-4,-2],'세 사람을 각자의 대피소로 옮긴 뒤 기지로 귀환하세요. 급유를 너무 일찍 쓰면 돌아올 연료가 없어요.',{storms:wall(0,[0]),switches:[[-2,1]],gates:[{at:[0,0],switch:0}],pulses:[[0,0]],stations:[[1,1],[2,-2]],wave:[0,1,2,1],fuel:13,capacity:18,limit:43,par:38})
];
