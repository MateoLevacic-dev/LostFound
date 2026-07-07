export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateRegisterData(data) {
  if (!data.firstName || !data.lastName) {
    return 'Ime i prezime su obavezni.';
  }
  if (!data.username || data.username.length < 3) {
    return 'Korisničko ime mora imati najmanje 3 znaka.';
  }
  if (!validateEmail(data.email)) {
    return 'Unesite valjani email.';
  }
  if (!validatePassword(data.password)) {
    return 'Lozinka mora imati najmanje 6 znakova.';
  }
  if (data.password !== data.confirmPassword) {
    return 'Lozinke se ne podudaraju.';
  }
  if (!data.phone || data.phone.length < 7) {
    return 'Broj mobitela je obavezan.';
  }
  if (!data.city) {
    return 'Grad je obavezan.';
  }
  if (!data.terms) {
    return 'Prihvatite uvjete korištenja.';
  }
  return null;
}

export function validateLoginData(data) {
  const identifier = data.email || data.identifier || '';
  if (!identifier || (!validateEmail(identifier) && identifier.trim().length < 3)) {
    return 'Unesite valjani email ili korisničko ime.';
  }
  if (!validatePassword(data.password)) {
    return 'Unesite valjanu lozinku.';
  }
  return null;
}

export function validatePostData(data) {
  const required = ['type','title','description','category','date','location','city','address','image','contactPhone','contactEmail'];
  for (const field of required) {
    if (!data[field]) {
      return 'Molimo ispunite sva obavezna polja.';
    }
  }
  if (!validateEmail(data.contactEmail)) {
    return 'Unesite valjani email za kontakt.';
  }
  return null;
}

export function validateContactData(data) {
  if (!data.name || !data.email || !data.message) {
    return 'Sva polja su obavezna.';
  }
  if (!validateEmail(data.email)) {
    return 'Unesite valjani email.';
  }
  return null;
}
