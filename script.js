const container = document.getElementById('grid-container');
const retryButton = document.getElementById('retry');
const totalBlocks = 9 * 9;
let bombPositions = new Set();
let bombsClicked = 0;

function initializeGame() {
    container.innerHTML = '';
    bombPositions.clear();
    bombsClicked = 0;
    while (bombPositions.size < 5) {
        bombPositions.add(Math.floor(Math.random() * totalBlocks) + 1);
    }
    
    const gridWrapper = document.createElement('div');
    gridWrapper.style.display = 'grid';
    gridWrapper.style.gridTemplateColumns = 'repeat(10, 40px)';
    gridWrapper.style.gap = '5px';
    
    for (let row = 0; row <= 9; row++) {
        for (let col = 0; col <= 9; col++) {
            const cell = document.createElement('div');
            cell.style.width = '40px';
            cell.style.height = '40px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.backgroundColor = 'lightgray';
            cell.style.color = 'black';
            cell.style.fontWeight = 'bold';

            cell.addEventListener('mouseover', () => {
                if (cell.style.backgroundColor === 'lightgray') {
                    cell.style.backgroundColor = 'rgb(136, 130, 130)';
                }
            });

            cell.addEventListener('mouseout', () => {
                if (cell.style.backgroundColor === 'rgb(136, 130, 130)') {
                    cell.style.backgroundColor = 'lightgray';
                }
            });

            
            if (row === 0 && col > 0) {
                cell.textContent = String.fromCharCode(64 + col);
            } else if (col === 0 && row > 0) {
                cell.textContent = row;
            } else if (row > 0 && col > 0) {
                const blockNumber = (row - 1) * 9 + col;
                cell.classList.add('block');
                cell.dataset.number = blockNumber;
                
                cell.addEventListener('click', () => {
                    if (bombPositions.has(blockNumber)) {
                        cell.textContent = '💣';
                        cell.style.backgroundColor = 'red';
                        bombsClicked++;
                        if (bombsClicked === 5) {
                            alert('Game Over! You clicked all 5 bombs!');
                            gridWrapper.childNodes.forEach(b => b.style.pointerEvents = 'none');
                        }
                    } else {
                        let isClose = false;
                        bombPositions.forEach(bomb => {
                            const bombRow = Math.floor((bomb - 1) / 9);
                            const bombCol = (bomb - 1) % 9;
                            const blockRow = Math.floor((blockNumber - 1) / 9);
                            const blockCol = (blockNumber - 1) % 9;
                            
                            if (Math.abs(bombRow - blockRow) <= 1 && Math.abs(bombCol - blockCol) <= 1) {
                                isClose = true;
                            }
                        });
                        
                        cell.textContent = isClose ? 'g' : 'b';
                        cell.style.backgroundColor = isClose ? 'yellow' : 'blue';
                    }
                });
            }
            
            gridWrapper.appendChild(cell);
        }
    }
    
    container.appendChild(gridWrapper);
}

retryButton.addEventListener('click', initializeGame);

initializeGame();
