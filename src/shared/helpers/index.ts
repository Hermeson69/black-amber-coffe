const errorMap: Record<string, { status: number; message: string }> = {
  // Authentication Errors
  INVALID_CREDENTIALS: {
    status: 401,
    message: "Email ou senha inválidos.",
  },
  INVALID_TOKEN: {
    status: 401,
    message: "Token inválido ou expirado.",
  },
  TOKEN_EXPIRED: {
    status: 401,
    message: "Token expirado. Faça login novamente.",
  },
  UNAUTHORIZED: {
    status: 401,
    message: "Token de autenticação não fornecido.",
  },
  FORBIDDEN: {
    status: 403,
    message: "Acesso negado. Você não tem permissão para esta operação.",
  },

  // Client/User Errors
  CLIENT_ALREADY_EXISTS: {
    status: 400,
    message: "Já existe um cliente com esse email.",
  },
  WORKER_ALREADY_EXISTS: {
    status: 400,
    message: "Já existe um funcionário com esse email.",
  },
  CLIENT_NOT_FOUND: {
    status: 404,
    message: "Cliente não encontrado.",
  },
  WORKER_NOT_FOUND: {
    status: 404,
    message: "Funcionário não encontrado.",
  },
  PROFILE_NOT_FOUND: {
    status: 404,
    message: "Perfil não encontrado.",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "Usuário não encontrado.",
  },

  // Validation Errors
  INVALID_EMAIL: {
    status: 400,
    message: "Email inválido.",
  },
  INVALID_PASSWORD: {
    status: 400,
    message: "Senha deve ter no mínimo 6 caracteres.",
  },
  INVALID_PHONE: {
    status: 400,
    message: "Telefone inválido.",
  },
  INVALID_ROLE: {
    status: 400,
    message:
      "Função/papel inválido. Valores permitidos: ADMIN, BARISTA, BARMAN, WAITER.",
  },
  INVALID_SALARY: {
    status: 400,
    message: "Salário deve ser um número positivo.",
  },
  INVALID_REQUEST: {
    status: 400,
    message: "Requisição inválida. Verifique os parâmetros enviados.",
  },
  MISSING_REQUIRED_FIELDS: {
    status: 400,
    message: "Campos obrigatórios não fornecidos.",
  },

  // General Errors
  NOT_FOUND: {
    status: 404,
    message: "Recurso não encontrado.",
  },
  INTERNAL_ERROR: {
    status: 500,
    message: "Erro interno do servidor. Tente novamente mais tarde.",
  },
  BAD_REQUEST: {
    status: 400,
    message: "Solicitação inválida.",
  },
};

export default errorMap;
