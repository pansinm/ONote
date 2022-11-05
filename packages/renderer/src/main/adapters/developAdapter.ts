class DevelopAdapter {
  openDevTools() {
    window.simmer?.callDevelop('openDevTools');
  }
}

export default new DevelopAdapter();
