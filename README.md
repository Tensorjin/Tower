# Tower Defense Game

A 3D tower defense game built with Three.js, featuring low-poly graphics and simple gameplay mechanics.

## Features

- 3D low-poly graphics
- Tower placement system
- Enemy wave spawning
- Resource management
- Simple UI

## Getting Started

1. Clone this repository
2. Set up a local server (you can use any of these methods):
   - Use VS Code's Live Server extension
   - Python: `python -m http.server`
   - Node.js: `npx serve`
3. Open the game in your browser

## Deployment

This game can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Deploy with default settings (no configuration needed)

## How to Play

1. **Resources**: You start with 100 resources
2. **Tower Placement**: Click on any buildable tile to place a tower (costs 50 resources)
3. **Start Wave**: Click the "Start Wave" button to begin spawning enemies
4. **Waves**: Complete waves to earn additional resources
5. **Victory**: Defend your base by preventing enemies from reaching the end

## Project Structure

```
tower-defense/
├── index.html           # Main game page
├── assets/
│   └── styles/         # CSS styles
│       └── main.css
├── src/
│   ├── main.js         # Game initialization
│   ├── assets/         # 3D assets
│   │   └── GameAssets.js
│   └── core/          # Game logic
│       └── Game.js
```

## Future Enhancements

- Tower targeting and shooting mechanics
- Enemy health and damage system
- Multiple tower types
- Improved path finding
- Sound effects and music
- Score system
