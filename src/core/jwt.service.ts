import jwt from "jsonwebtoken";
import { JWTEXPIRATION, JWTREFRESHSECRET, JWTSECRETKEY } from "../config/env";
/**
 * Interface for validate a token per role and type of user
 */
interface JWTPayload {
  id: number;
  email: string;
  role?: string;
}

export default class JWTservice {
  private secret: string;
  private expriration: string;
  private refresh: string;

  constructor() {
    this.secret = JWTSECRETKEY ?? "seu_secret_padrao";
    this.expriration = JWTEXPIRATION ?? "7d";
    this.refresh = JWTREFRESHSECRET ?? "seu_refresh_aqui";
  }

  /**
   * Gerar o token JWT
   * @param payload 
   * @returns retorna que o uruario estara logado até que sua section de 7d acabe
   */
  
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expriration as any,
    });
  }

  /**
   * Verificar o token do usuario ao fazer login
   * @param token 
   * @returns o decoded para ver se é valido
   */

  verifyToken (token: string): JWTPayload | null{
    try{
      const decoded = jwt.verify(token, this.secret) as JWTPayload;
      return decoded
    }catch(error){
      return null;
    }
  }

  /**
   * Extrair o token do cabeçalho para poder checar no middleWare ou em outras instancias se existe
   * @param authHeader passo o header do json, separo em partes se for diferente 1 (token) ou  0 tipo do token retorno null se não retorno o token
   * @returns token do usuario passado via json (web né vida)
   */

  extractTokenFromHeader (authHeader: string | undefined): string | null {
    if(!authHeader){
      throw new Error ("Sem token presente no cabeçalho")
    }

    const parts = authHeader.split(" ");
    if(parts.length !== 2 || parts[0] !== "Bearer"){
      return null;
    }

    return parts[1];
  }

  generateRefreshToken(userId: string):string{
    return jwt.sign({id: userId}, this.refresh!, {expiresIn: "1h"})
  }

}