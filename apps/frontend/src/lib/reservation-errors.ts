const MESSAGES: Record<number, string> = {
  400: 'La demande est invalide. Vérifiez le créneau et le nombre de participants.',
  401: 'Votre session a expiré. Reconnectez-vous pour réserver.',
  403: "Vous n'avez pas les droits pour cette réservation.",
  404: "Cette salle ou cette réservation n'existe plus.",
  409: "Ce créneau n'est plus disponible. Choisissez-en un autre.",
};

export const reservationError = (status: number | undefined) =>
  (status && MESSAGES[status]) || "La demande n'a pas pu être envoyée. Réessayez.";
