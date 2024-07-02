import React from 'react';

export default class LoadingComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {pageKey:props.pageKey, loading: props.loading };
	}

	componentDidMount() {
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.state.pageKey !== nextProps.pageKey) {
			this.setState({pageKey:nextProps.pageKey});
		}
		if (this.state.loading !== nextProps.loading) {
			if (nextProps.loading)
				this.setState({loading:true}, () => {
					this.setState({loadInner:true})
				});
			else {
				this.setState({loadInner:false});
				setTimeout(() => {
					this.setState({loading:false})
				}, 500);
			}
		}
	}

	render() {
		const {pageKey, loading, loadInner} = this.state;
		return (
			<div className={`back-board over-board flex loading ${loading?'active':''} ${loadInner?'show':''}`}>
				<div className='loading-circle'></div>
			</div>
		);
	}
}
