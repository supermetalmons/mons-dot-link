import React, { useEffect, useState } from "react";
import styled from "styled-components";

export const LeaderboardContainer = styled.div<{ show: boolean }>`
  opacity: ${(props) => (props.show ? 1 : 0)};
  height: ${(props) => (props.show ? "calc(69dvh - 10px)" : 0)};
  margin-top: ${(props) => (props.show ? "-18px" : "-6px")};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #333;

  @media (prefers-color-scheme: dark) {
    color: #f5f5f5;
  }

  th,
  td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;

    @media (prefers-color-scheme: dark) {
      border-bottom: 1px solid #333;
    }
  }
`;

const TableWrapper = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const LoadingText = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #777;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (prefers-color-scheme: dark) {
    color: #afafaf;
  }
`;

interface LeaderboardProps {
  show: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ show }) => {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    if (show) {
      setData([
        { player: "Player 1", games: 156, rating: 2500 },
        { player: "Player 2", games: 143, rating: 2475 },
        { player: "Player 3", games: 134, rating: 2450 },
        { player: "Player 4", games: 128, rating: 2425 },
        { player: "Player 5", games: 115, rating: 2400 },
        { player: "Player 6", games: 98, rating: 2375 },
        { player: "Player 7", games: 92, rating: 2350 },
        { player: "Player 8", games: 87, rating: 2325 },
        { player: "Player 9", games: 76, rating: 2300 },
        { player: "Player 10", games: 71, rating: 2275 },
        { player: "Player 11", games: 65, rating: 2250 },
        { player: "Player 12", games: 58, rating: 2225 },
        { player: "Player 13", games: 52, rating: 2200 },
        { player: "Player 14", games: 45, rating: 2175 },
        { player: "Player 15", games: 39, rating: 2150 },
        { player: "Player 16", games: 34, rating: 2125 },
        { player: "Player 17", games: 28, rating: 2100 },
        { player: "Player 18", games: 23, rating: 2075 },
        { player: "Player 19", games: 18, rating: 2050 },
        { player: "Player 20", games: 12, rating: 2025 },
      ]);
    }
  }, [show]);

  return (
    <LeaderboardContainer show={show}>
      {data ? (
        <TableWrapper>
          <LeaderboardTable>
            <thead>
              <tr>
                <th>Player</th>
                <th>Games</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, index: number) => (
                <tr key={index}>
                  <td>{row.player}</td>
                  <td>{row.games}</td>
                  <td>{row.rating}</td>
                </tr>
              ))}
            </tbody>
          </LeaderboardTable>
        </TableWrapper>
      ) : (
        <LoadingText>UPDATING...</LoadingText>
      )}
    </LeaderboardContainer>
  );
};
