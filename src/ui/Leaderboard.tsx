import React, { useEffect, useState } from "react";
import styled from "styled-components";

export const LeaderboardContainer = styled.div<{ show: boolean }>`
  opacity: ${(props) => (props.show ? 1 : 0)};
  height: ${(props) => (props.show ? "calc(69dvh - 80px)" : 0)};
  overflow: hidden;
  margin-top: -6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const LeaderboardTable = styled.table`
  margin-top: -10px;
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

const EASLink = styled.a`
  display: block;
  text-align: center;
  padding: 0 0;
  text-decoration: none;
  font-size: 0.8rem;

  &:hover {
    text-decoration: underline;
  }
`;

interface LeaderboardProps {
  show: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ show }) => {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    if (show) {
      setData(null);
      const timer = setTimeout(() => {
        setData([
          { player: "Player 1", games: 69, rating: 2400 },
          { player: "Player 2", games: 42, rating: 2350 },
          { player: "Player 3", games: 23, rating: 2300 },
        ]);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <LeaderboardContainer show={show}>
      {data ? (
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
      ) : (
        <LoadingText>UPDATING...</LoadingText>
      )}
      <EASLink href="https://base.easscan.org/schema/view/0x5c6e798cbb817442fa075e01b65d5d65d3ac35c2b05c1306e8771a1c8a3adb32" target="_blank" rel="noopener noreferrer">
        View on EAS Explorer
      </EASLink>
    </LeaderboardContainer>
  );
};
