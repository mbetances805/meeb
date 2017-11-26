/* eslint-disable no-lone-blocks */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { editNote, fetchNotes, deleteNote, fetchRoom } from '../store'
import { withRouter } from 'react-router'
import ContentEditable from 'react-contenteditable'
import debounce from 'lodash/debounce'

class Whiteboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dragging: false,
      rel: null,
      pos: {x: null, y: null},
      selectedNote: 0,
      content: {}
    }
    this.clickImage = this.clickImage.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.changed = debounce(this.props.editNote, 250)
  }


  componentDidMount() {
    this.props.fetchRoom(this.props.match.params.id)
    this.props.fetchNotes(this.props.match.params.id)
    console.log('the window', document.getElementById('whiteboard').getBoundingClientRect())
  }

  componentDidUpdate(props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }
  }

  clickImage (evt) {
    evt.preventDefault();
  }

  //when user clicks mouse down, dragging state is set to true and new relative position
  //is calculated, the position is set to null
  onMouseDown(evt) {
    if (evt.button !== 0) return

    var pos = evt.target.getBoundingClientRect()
    this.setState({
      dragging: true,
      rel: {
        x: evt.pageX - pos.left,
        y: evt.pageY - pos.top
      },
      pos: {
        x: null,
        y: null
      }
    })
    evt.stopPropagation()
    evt.preventDefault()
  }

  //once mouse is released, the new position of note is updated in db
  //and dragging is set to false
  onMouseUp(evt) {
    if (this.state.pos.x !== null && this.state.pos.y !== null) this.props.editNote(this.state.selectedNote, {position: [this.state.pos.x, this.state.pos.y]})
    evt.stopPropagation()
    evt.preventDefault()
    this.setState({dragging: false})
  }


  //when state.pos is set to anything but null, the top and left of card is set to state.pos instead of note.position[0] & note.position[1]
  onMouseMove(evt) {
    if (!this.state.dragging) return
    this.setState({
      pos: {
        x: evt.pageX - this.state.rel.x,
        y: evt.pageY - this.state.rel.y
      }
    })
    evt.stopPropagation()
    evt.preventDefault()
  }

  handleDelete(evt) {
    evt.preventDefault();
    this.props.deleteNote(evt.target.value, this.props.boardId);
  }

  handleChange(evt) {
    evt.preventDefault()
    console.log(evt.target.value)
    let content = {...this.state.content}
    content[this.state.selectedNote] = evt.target.value
    this.setState({ content })
    this.changed(this.state.selectedNote, { text: evt.target.value })
    // this.setState({ content: '' })
  }


  render() {
    const { userId, hostId } = this.props
    let data = [];
    if (this.props.notes) {
      data = this.props.notes
    }

    return (
      <div id="whiteboard">
       <svg id="basket" width="300" height="250">
      <g>
        <rect
           width="300" height="250"
        style = {{fill: 'white', stroke: 'black', strokeWidth: 5, opacity: 0.5}} />
        <text x="4" y="50" fontFamily="Verdana" fontSize="35" fill="blue">Idea Basket</text>
      </g>
      </svg>
      {
        data && data.map((note) => {
          {
            return note.position &&
             (
                  <div
                    className="card"
                    key={note.id}
                    style = {{position: 'absolute', left: this.state.selectedNote === note.id && this.state.pos.x || note.position[0], top: this.state.selectedNote === note.id && this.state.pos.y || note.position[1], cursor: 'pointer' }}
                    >

                  {this.props.open &&
                  <span>
                    <button value={note.id} onClick={this.handleDelete}>x</button>
                    <button
                        onMouseMove={this.onMouseMove}
                        onMouseUp={this.onMouseUp}
                        onMouseDown={(evt) => {this.setState({ selectedNote: note.id }); this.onMouseDown(evt)}}
                        style={{borderRadius: '25px'}}
                    > Drag
                    </button>
                  </span>
                  }

                    { note.text &&
                      <ContentEditable
                        onClick={() => this.setState({ selectedNote: note.id })}
                        className="card-content"
                        html={this.state.content[note.id] || note.text}
                        disabled={userId !== note.userId && userId !== hostId}
                        onChange={this.handleChange}
                        contentEditable="plaintext-only"
                      />
                    }


                    {note.image &&
                      <div className="card-image">
                        <img onClick={this.clickImage} src={note.image} />
                      </div>
                    }


                    {note.link &&
                      <div className="card-action">
                        <a type="text/css" href={note.link}>Go Here </a>
                      </div>
                    }

                  </div>

                )
            }

          })
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  notes: state.notes,
  boardId: state.singleWhiteboard.id,
  hostId: state.singleWhiteboard.userId,
  userId: state.user.id,
  open: !state.singleWhiteboard.closed
})

const mapDispatchToProps = { editNote, fetchNotes, deleteNote, fetchRoom }

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Whiteboard));


/////
    // //In getBoundingClientREact:
    // //x - left most margin of element
    // //y- the bottom most margin of element
    // //bottom - distance from top to bottom most margin
    // componentDidMount() {
    //   this.props.fetchNotes(this.props.match.params.id)
    //   let data = document.getElementById('whiteboard').getBoundingClientRect();
    //   let eNoteWidth = 270;
    //   let eNoteHeight = 150;
    //   //this.positions = this.generatePositionsArray(data.height, data.width, eNoteHeight, eNoteWidth, data.left, data.top );
    //   this.positions = this.generatePositionsArray(4000, 4000, eNoteHeight, eNoteWidth, data.left, data.top);
    // }

    // // Returns a random integer between min (included) and max (excluded)
    //     // Using Math.round() will give you a non-uniform distribution!
    // getRandomInt(min, max) {
    //   return Math.floor(Math.random() * (max - min)) + min;
    // }

    // // generate random positions
    // generatePositionsArray(boardHeight, boardWidth, safeHeight, safeWidth, leftBegin, topBegin) {
    //   let irregularity = 0.5;
    //   // declarations
    //   var positionsArray = [];
    //   var r, c;
    //   var rows;
    //   var columns;
    //   // count the amount of rows and columns
    //   rows = Math.floor(boardHeight / safeHeight);
    //   columns = Math.floor(boardWidth / safeWidth);
    //   // loop through rows
    //   for (r = 1; r <= rows; r += 1) {
    //     // loop through columns
    //     for (c = 1; c <= columns; c += 1) {
    //       // populate array with point object
    //       positionsArray.push({
    //         x: Math.round(boardWidth * c / columns) + (this.getRandomInt(irregularity * -1, irregularity)) + (leftBegin / 4),
    //         y: Math.round(boardHeight * r / rows) + (this.getRandomInt(irregularity * -1, irregularity))
    //       });
    //     }
    //   }
    //   // return array
    //   return positionsArray;
    // }
    // // get random position from positions array
    // getRandomPosition(removeTaken) {
    //   // declarations
    //   var randomIndex;
    //   var coordinates;
    //   // get random index
    //   randomIndex = this.getRandomInt(0, this.positions.length - 1);
    //   // get random item from array
    //   coordinates = this.positions[randomIndex];
    //   // check if remove taken
    //   if (removeTaken) {
    //     // remove element from array
    //     this.positions = [...this.positions.slice(0, randomIndex), ...this.positions.slice(randomIndex + 1)]
    //   }
    //   // return position
    //   return coordinates;
    // }
    // // getRandomPosition(positions, true)
    // getPosition(noteId) {
    //   let pos = this.getRandomPosition(true);
    //   this.props.editNote(noteId, { position: [pos.x, pos.y] })
    //   return {
    //     style: {
    //       position: 'fixed',
    //       left: pos.x,    // computed based on child and parent's height
    //       top: pos.y   // computed based on child and parent's width
    //     }
    //   }
    // }

    // removePosition(takenPosition) {
    //   this.positions = this.positions.filter(aPosition =>
    //     (aPosition[0] != takenPosition[0]) && (aPosition[1] != takenPosition[1])
    //   )
    // }
  // //render method
  // data.map(note => {
  //   note.position && this.removePosition(note.position)
  // })
