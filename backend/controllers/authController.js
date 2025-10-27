// Accept all usernames and passwords, return a dummy token
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const fakeToken = "token-" + Date.now();
  res.status(200).json({ token: fakeToken });
};
