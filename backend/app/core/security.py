from passlib.context import CryptContext

# bcrypt = algo sécurisé et standard pour les mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Retourne un hash bcrypt à partir d'un mot de passe en clair.
    Le mot de passe en clair ne doit jamais être stocké.
    """
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    Vérifie qu'un mot de passe en clair correspond à un hash stocké.
    """
    return pwd_context.verify(password, password_hash)
