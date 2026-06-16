import type { RankingUser } from "@/types";

/** Cliente "logado" (mock) — usado só para destacar a posição no ranking. */
export const CURRENT_USER_ID = "u-marcio";

/** Usuários mockados que alimentam o ranking do mês. */
export const RANKING_USERS: RankingUser[] = [
  { id: "u-junior", name: "Júnior José", avatarColor: "#f59e0b", cidade: "Divinópolis / MG", pedidos: 18, pontos: 1240 },
  { id: "u-william", name: "William Costa", avatarColor: "#3b82f6", cidade: "Belo Horizonte / MG", pedidos: 14, pontos: 980 },
  { id: "u-alexis", name: "Alexis Souza", avatarColor: "#a855f7", cidade: "Contagem / MG", pedidos: 11, pontos: 760 },
  { id: "u-marcio", name: "Márcio Dias", avatarColor: "#22c55e", cidade: "Divinópolis / MG", pedidos: 9, pontos: 620 },
  { id: "u-daniel", name: "Daniel Faria", avatarColor: "#06b6d4", cidade: "Betim / MG", pedidos: 8, pontos: 540 },
  { id: "u-tatiane", name: "Tatiane Lima", avatarColor: "#ec4899", cidade: "Sete Lagoas / MG", pedidos: 7, pontos: 480 },
  { id: "u-bruno", name: "Bruno Antunes", avatarColor: "#14b8a6", cidade: "Uberlândia / MG", pedidos: 6, pontos: 410 },
  { id: "u-carla", name: "Carla Menezes", avatarColor: "#f97316", cidade: "Juiz de Fora / MG", pedidos: 5, pontos: 350 },
  { id: "u-rafael", name: "Rafael Pinto", avatarColor: "#8b5cf6", cidade: "Divinópolis / MG", pedidos: 4, pontos: 290 },
  { id: "u-luana", name: "Luana Reis", avatarColor: "#ef4444", cidade: "Itaúna / MG", pedidos: 3, pontos: 210 },
];

/** Lista ordenada por pontos (desc), com posição calculada. */
export interface RankedUser extends RankingUser {
  position: number;
  isCurrent: boolean;
}

export function getRankedUsers(): RankedUser[] {
  return [...RANKING_USERS]
    .sort((a, b) => b.pontos - a.pontos)
    .map((user, index) => ({
      ...user,
      position: index + 1,
      isCurrent: user.id === CURRENT_USER_ID,
    }));
}

export function getCurrentUserRank(): RankedUser | undefined {
  return getRankedUsers().find((u) => u.isCurrent);
}
