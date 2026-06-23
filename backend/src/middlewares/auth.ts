import type { Request, Response, NextFunction } from 'express';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';

// 🔥 Extender el tipo Request de Express sin usar `namespace`
declare module 'express' {
  interface Request {
    user?: User;
    userRole?: string;
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;

    // Obtener rol desde la tabla `usuarios`
    const { data: userData, error: roleError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('email', user.email)
      .single();

    if (roleError || !userData) {
      return res.status(403).json({ error: 'User role not found' });
    }
    req.userRole = userData.rol;
    next();
  } catch (_error) {
    // El `_error` indica que no se usa, pero es obligatorio en catch
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json({ error: `Role ${role} required` });
    }
    next();
  };
};