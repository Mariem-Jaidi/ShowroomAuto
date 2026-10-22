import { Component,Input,Output , EventEmitter } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Auto } from '../../interfaces/auto' ;
@Component({
  imports: [FontAwesomeModule ],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  faMagnifyingGlass=faMagnifyingGlass
  @Input() autos: Auto[]= []

  @Output() onSelectCar = new EventEmitter<Auto>()
  
  selectedAutos: Auto[] = []

  // current filter values
  currentBrand: string = ''
  currentModel: string = ''
  currentPower: string = ''
  currentSort: string = ''

  // this method runs every time any filter changes
  applyFilters(){
    // start from the full list
    let result = this.autos

    // filter by brand (text input)
    if(this.currentBrand){
      result = result.filter(x =>
        x.brand.toLowerCase().startsWith(this.currentBrand.toLowerCase())
      )
    }

    // filter by model (dropdown)
    if(this.currentModel){
      result = result.filter(x => x.model === this.currentModel)
    }

    // filter by power range (dropdown)
    if(this.currentPower === 'low'){
      result = result.filter(x => x.power < 10)
    }
    else if(this.currentPower === 'mid'){
      result = result.filter(x => x.power >= 10 && x.power <= 15)
    }
    else if(this.currentPower === 'high'){
      result = result.filter(x => x.power > 15)
    }

    // sort by price (dropdown)
    if(this.currentSort === 'price-asc'){
      result = result.slice().sort((a, b) => a.price - b.price)
    }
    else if(this.currentSort === 'price-desc'){
      result = result.slice().sort((a, b) => b.price - a.price)
    }

    this.selectedAutos = result
  }

  // called when user types in the brand input
  selectAutos(brand: string){
    this.currentBrand = brand
    this.applyFilters()
  }

  // called when user picks a model from the dropdown
  filterByModel(model: string){
    this.currentModel = model
    this.applyFilters()
  }

  // called when user picks a power range from the dropdown
  filterByPower(power: string){
    this.currentPower = power
    this.applyFilters()
  }

  // called when user picks a sort option
  sortCars(sortValue: string){
    this.currentSort = sortValue
    this.applyFilters()
  }

  // builds the list of unique models based on the current brand filter
  getModels(): string[] {
    let source = this.autos
    if(this.currentBrand){
      source = source.filter(x =>
        x.brand.toLowerCase().startsWith(this.currentBrand.toLowerCase())
      )
    }
    // get unique model names
    let models: string[] = []
    for(let car of source){
      if(!models.includes(car.model)){
        models.push(car.model)
      }
    }
    return models
  }

  selectCar(auto:Auto){
    this.onSelectCar.emit(auto)
  }
}
